#!/usr/bin/env python3

import subprocess
import os
from pathlib import Path

# Create a test WAV file first
print("Creating test WAV file...")
subprocess.run([
    "ffmpeg", "-f", "lavfi", "-i", "sine=frequency=1000:duration=2", 
    "-acodec", "pcm_s24le", "-ar", "44100", "-ac", "2", 
    "test_input.wav", "-y"
], check=True)

print("Converting to MP3...")
result = subprocess.run([
    "ffmpeg", "-i", "test_input.wav", 
    "-codec:a", "libmp3lame", 
    "-b:a", "320k", 
    "-y",
    "test_output.mp3"
], check=True, capture_output=True, text=True)

print(f"FFmpeg output: {result.stdout}")
print(f"FFmpeg stderr: {result.stderr}")

if os.path.exists("test_output.mp3"):
    print("✅ MP3 conversion successful!")
    print(f"File size: {os.path.getsize('test_output.mp3')} bytes")
else:
    print("❌ MP3 conversion failed!")

# Cleanup
os.remove("test_input.wav")
if os.path.exists("test_output.mp3"):
    os.remove("test_output.mp3")

