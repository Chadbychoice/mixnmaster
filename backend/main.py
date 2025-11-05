from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import asyncio
from pathlib import Path
import matchering as mg
import redis
import json
from datetime import datetime
import yt_dlp

app = FastAPI(title="MatchMaster API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage for demo (replace with Redis in production)
jobs_storage = {}

# Configuration
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

def download_youtube_audio(url: str, output_path: Path) -> str:
    """Download audio from YouTube URL and return the filename"""
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': str(output_path / '%(title)s.%(ext)s'),
        'extractaudio': True,
        'audioformat': 'wav',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # Extract info to get the filename
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'youtube_audio')
            # Clean filename
            safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_title = safe_title.replace(' ', '_')[:50]  # Limit length
            
            # Download the audio
            ydl.download([url])
            
            # Find the downloaded file
            for file in output_path.glob(f"{safe_title}.*"):
                if file.suffix.lower() in ['.wav', '.mp3', '.m4a', '.webm']:
                    return file.name
            
            # If no file found with expected name, find any audio file
            for file in output_path.glob("*"):
                if file.suffix.lower() in ['.wav', '.mp3', '.m4a', '.webm']:
                    return file.name
                    
            raise Exception("No audio file found after download")
            
        except Exception as e:
            raise Exception(f"YouTube download failed: {str(e)}")

# Pydantic models
class MasterJob(BaseModel):
    target_file: str
    reference_file: Optional[str] = None
    youtube_url: Optional[str] = None  # YouTube URL for reference
    mastering_mode: str = "reference"  # "reference" or "standalone"
    genre: Optional[str] = None  # Genre for standalone mastering
    output_formats: List[str] = ["pcm16", "pcm24", "mp3"]
    user_id: Optional[str] = None

class JobStatus(BaseModel):
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: int
    message: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    output_files: List[str] = []

@app.get("/")
async def root():
    return {"message": "MatchMaster API is running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload an audio file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {
        "file_id": file_id,
        "filename": filename,
        "original_name": file.filename,
        "size": len(content)
    }

@app.post("/api/master")
async def create_master_job(job: MasterJob, background_tasks: BackgroundTasks):
    """Create a new mastering job"""
    job_id = str(uuid.uuid4())
    
    # Validate target file exists
    target_path = UPLOAD_DIR / job.target_file
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Target file not found")
    
    # Validate reference file if in reference mode
    reference_path = None
    if job.mastering_mode == "reference":
        if not job.reference_file and not job.youtube_url:
            raise HTTPException(status_code=400, detail="Reference file or YouTube URL required for reference matching mode")
        
        if job.youtube_url:
            # YouTube URL provided - will download during processing
            reference_path = "youtube_download"  # Placeholder, will be handled in processing
        elif job.reference_file:
            # Regular file upload
            reference_path = UPLOAD_DIR / job.reference_file
            if not reference_path.exists():
                raise HTTPException(status_code=404, detail="Reference file not found")
    
    # Create job status
    job_status = JobStatus(
        job_id=job_id,
        status="pending",
        progress=0,
        message="Job created",
        created_at=datetime.now()
    )
    
    # Store job in memory
    jobs_storage[job_id] = job_status.dict()
    # Convert datetime to string for JSON serialization
    jobs_storage[job_id]["created_at"] = jobs_storage[job_id]["created_at"].isoformat()
    
    # Start processing in background
    background_tasks.add_task(process_master_job, job_id, str(target_path), str(reference_path), job.output_formats, job.mastering_mode, job.genre, job.youtube_url)
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get job status"""
    if job_id not in jobs_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs_storage[job_id]

@app.get("/api/download/{job_id}/{filename}")
async def download_file(job_id: str, filename: str):
    """Download processed file"""
    file_path = OUTPUT_DIR / job_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path, filename=filename)

async def process_master_job(job_id: str, target_path: str, reference_path: str, output_formats: List[str], mastering_mode: str, genre: str = None, youtube_url: str = None):
    """Process mastering job using Matchering"""
    try:
        # Update status to processing
        update_job_status(job_id, "processing", 10, "Starting processing...")
        
        # Handle YouTube download if needed
        if youtube_url and reference_path == "youtube_download":
            update_job_status(job_id, "processing", 15, "Downloading reference from YouTube...")
            try:
                reference_filename = download_youtube_audio(youtube_url, UPLOAD_DIR)
                reference_path = str(UPLOAD_DIR / reference_filename)
                update_job_status(job_id, "processing", 20, "YouTube download completed")
            except Exception as e:
                update_job_status(job_id, "failed", 0, f"YouTube download failed: {str(e)}")
                return
        
        # Create output directory
        output_dir = OUTPUT_DIR / job_id
        output_dir.mkdir(exist_ok=True)
        
        # Prepare output files
        output_files = []
        mg_outputs = []
        
        for format_type in output_formats:
            if format_type == "mp3":
                # MP3 will be converted after WAV processing
                continue
            else:
                filename = f"mastered_{format_type}.wav"
                file_path = output_dir / filename
                output_files.append(filename)
                
                if format_type == "pcm16":
                    mg_outputs.append(mg.pcm16(str(file_path)))
                elif format_type == "pcm24":
                    mg_outputs.append(mg.pcm24(str(file_path)))
        
        update_job_status(job_id, "processing", 30, f"Processing with {mastering_mode} mode...")
        
        # Process with Matchering based on mode
        if mastering_mode == "reference" and reference_path:
            # Reference matching mode
            mg.process(
                target=target_path,
                reference=reference_path,
                results=mg_outputs,
            )
        else:
            # Standalone mastering mode - create a genre-specific reference file
            update_job_status(job_id, "processing", 50, f"Creating {genre} reference for standalone mastering...")
            
            # For standalone mode, we need to create a genre-specific reference file
            # This approach creates a reference that matches the characteristics of the selected genre
            import numpy as np
            import soundfile as sf
            
            # Load the target file to get its properties
            target_data, target_sr = sf.read(target_path)
            
            # Genre-specific parameters
            genre_params = {
                'pop': {'freq': 440, 'harmonics': 3, 'bass_boost': 0.1},
                'rock': {'freq': 220, 'harmonics': 5, 'bass_boost': 0.2},
                'electronic': {'freq': 880, 'harmonics': 2, 'bass_boost': 0.3},
                'hip-hop': {'freq': 110, 'harmonics': 4, 'bass_boost': 0.4},
                'jazz': {'freq': 330, 'harmonics': 6, 'bass_boost': 0.05},
                'classical': {'freq': 440, 'harmonics': 8, 'bass_boost': 0.0},
                'country': {'freq': 220, 'harmonics': 4, 'bass_boost': 0.1},
                'blues': {'freq': 165, 'harmonics': 7, 'bass_boost': 0.15},
                'folk': {'freq': 330, 'harmonics': 3, 'bass_boost': 0.05}
            }
            
            # Get genre parameters (default to pop if not found)
            if not genre or genre not in genre_params:
                genre = 'pop'  # Default to pop if genre is None or invalid
            params = genre_params[genre]
            
            # Create genre-specific reference
            duration = len(target_data) / target_sr
            t = np.linspace(0, duration, len(target_data), False)
            
            # Generate complex waveform with harmonics
            # Start with mono waveform
            reference_wave_mono = np.zeros(len(target_data))
            for i in range(1, params['harmonics'] + 1):
                amplitude = 0.1 / i  # Decreasing amplitude for higher harmonics
                reference_wave_mono += amplitude * np.sin(2 * np.pi * params['freq'] * i * t)
            
            # Apply bass boost
            if params['bass_boost'] > 0:
                # Simple low-pass filter effect
                reference_wave_mono += params['bass_boost'] * np.sin(2 * np.pi * params['freq'] * 0.5 * t)
            
            # Normalize
            reference_wave_mono = reference_wave_mono / np.max(np.abs(reference_wave_mono)) * 0.1
            
            # Ensure same shape as target
            if len(target_data.shape) == 2:  # Stereo
                reference_wave = np.column_stack([reference_wave_mono, reference_wave_mono])
            else:  # Mono
                reference_wave = reference_wave_mono
            
            # Save genre-specific reference temporarily
            genre_ref_path = output_dir / f"{genre}_reference.wav"
            sf.write(str(genre_ref_path), reference_wave, target_sr)
            
            try:
                # Process with the genre-specific reference
                mg.process(
                    target=target_path,
                    reference=str(genre_ref_path),
                    results=mg_outputs,
                )
            finally:
                # Clean up the temporary reference file
                if genre_ref_path.exists():
                    genre_ref_path.unlink()
        
        # Convert to MP3 if requested
        if "mp3" in output_formats:
            update_job_status(job_id, "processing", 85, "Converting to MP3...")
            try:
                # Use the highest quality WAV as source for MP3 conversion
                source_wav = output_dir / "mastered_pcm24.wav"
                if not source_wav.exists():
                    source_wav = output_dir / "mastered_pcm16.wav"
                
                if source_wav.exists():
                    mp3_path = output_dir / "mastered.mp3"
                    
                    # Try system ffmpeg first, then ffmpeg-python
                    try:
                        import subprocess
                        subprocess.run([
                            "ffmpeg", "-i", str(source_wav), 
                            "-codec:a", "libmp3lame", 
                            "-b:a", "320k", 
                            "-y",  # Overwrite output file
                            str(mp3_path)
                        ], check=True, capture_output=True)
                    except (subprocess.CalledProcessError, FileNotFoundError):
                        # Fallback to ffmpeg-python
                        try:
                            import ffmpeg
                            (
                                ffmpeg
                                .input(str(source_wav))
                                .output(str(mp3_path), acodec='libmp3lame', audio_bitrate='320k')
                                .overwrite_output()
                                .run(quiet=True)
                            )
                        except Exception as ffmpeg_py_error:
                            print(f"ffmpeg-python also failed: {ffmpeg_py_error}")
                            raise ffmpeg_py_error
                    
                    if mp3_path.exists():
                        output_files.append("mastered.mp3")
            except Exception as e:
                print(f"MP3 conversion failed: {e}")
                # Continue without MP3 if conversion fails
        
        update_job_status(job_id, "processing", 90, "Finalizing...")
        
        # Update status to completed
        jobs_storage[job_id]["status"] = "completed"
        jobs_storage[job_id]["progress"] = 100
        jobs_storage[job_id]["message"] = "Processing completed successfully"
        jobs_storage[job_id]["completed_at"] = datetime.now().isoformat()
        jobs_storage[job_id]["output_files"] = output_files
        
    except Exception as e:
        # Update status to failed
        update_job_status(job_id, "failed", 0, f"Processing failed: {str(e)}")

def update_job_status(job_id: str, status: str, progress: int, message: str):
    """Update job status in memory"""
    if job_id in jobs_storage:
        jobs_storage[job_id]["status"] = status
        jobs_storage[job_id]["progress"] = progress
        jobs_storage[job_id]["message"] = message

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
