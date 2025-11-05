import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Music, Zap, Download, Youtube, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const Home = () => {
  const [targetFile, setTargetFile] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [masteringMode, setMasteringMode] = useState('reference'); // 'reference' or 'standalone'
  const [selectedGenre, setSelectedGenre] = useState('pop'); // Genre for standalone mastering
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const onTargetDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setTargetFile(file);
      toast.success(`Target file uploaded: ${file.name}`);
    }
  };

  const onReferenceDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setReferenceFile(file);
      toast.success(`Reference file uploaded: ${file.name}`);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('http://localhost:8000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.filename;
  };

  const startMastering = async () => {
    if (!targetFile) {
      toast.error('Please upload a target file');
      return;
    }

    if (masteringMode === 'reference' && !referenceFile && !youtubeUrl) {
      toast.error('Please upload a reference file or provide a YouTube URL');
      return;
    }

    setIsProcessing(true);
    setJobStatus({ status: 'pending', progress: 0, message: 'Uploading files...' });

    try {
      // Upload target file
      const targetFilename = await uploadFile(targetFile);
      
      let referenceFilename = null;
      
      if (masteringMode === 'reference') {
        if (referenceFile) {
          // Upload reference file
          referenceFilename = await uploadFile(referenceFile);
        }
        // YouTube URL will be handled by the backend
      }

      // Create mastering job
      const response = await axios.post('http://localhost:8000/api/master', {
        target_file: targetFilename,
        reference_file: referenceFilename,
        youtube_url: masteringMode === 'reference' && youtubeUrl ? youtubeUrl : null,
        mastering_mode: masteringMode,
        genre: masteringMode === 'standalone' ? selectedGenre : null,
        output_formats: ['pcm16', 'pcm24', 'mp3']
      });

      setJobId(response.data.job_id);
      pollJobStatus(response.data.job_id);
    } catch (error) {
      toast.error('Error starting mastering job');
      setIsProcessing(false);
    }
  };

  const pollJobStatus = async (jobId) => {
    const poll = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/jobs/${jobId}`);
        const status = response.data;
        setJobStatus(status);

        if (status.status === 'completed') {
          setIsProcessing(false);
          toast.success('Mastering completed!');
        } else if (status.status === 'failed') {
          setIsProcessing(false);
          toast.error('Mastering failed: ' + status.message);
        } else {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        setIsProcessing(false);
        toast.error('Error checking job status');
      }
    };
    poll();
  };

  const downloadFile = (filename) => {
    window.open(`http://localhost:8000/api/download/${jobId}/${filename}`, '_blank');
  };

  const { getRootProps: getTargetRootProps, getInputProps: getTargetInputProps, isDragActive: isTargetDragActive } = useDropzone({
    onDrop: onTargetDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.aiff']
    },
    multiple: false
  });

  const { getRootProps: getReferenceRootProps, getInputProps: getReferenceInputProps, isDragActive: isReferenceDragActive } = useDropzone({
    onDrop: onReferenceDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.aiff']
    },
    multiple: false
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Professional Audio Mastering
        </h1>
        <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Upload your track and a reference song. Our AI will master your music to match the reference's sound, 
          RMS, frequency response, and stereo width.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI-Powered
          </span>
          <span className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Reference Matching
          </span>
          <span className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Multiple Formats
          </span>
        </div>
      </motion.div>

      {/* Mastering Mode Selector */}
      <motion.div 
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Mastering Options
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setMasteringMode('reference')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              masteringMode === 'reference'
                ? 'bg-blue-500 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Reference Matching
          </button>
          <button
            onClick={() => setMasteringMode('standalone')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              masteringMode === 'standalone'
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Standalone Mastering
          </button>
        </div>
        <p className="text-gray-300 text-sm mt-3">
          {masteringMode === 'reference' 
            ? 'Match your track to a reference song for consistent sound'
            : 'Apply professional mastering without reference matching'
          }
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div 
        className="grid md:grid-cols-2 gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Target File Upload */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Your Track (Target)</h3>
          <div
            {...getTargetRootProps()}
            className={`dropzone ${isTargetDragActive ? 'active' : ''} ${
              targetFile ? 'accept' : ''
            }`}
          >
            <input {...getTargetInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {targetFile ? (
              <div>
                <p className="text-green-400 font-medium">{targetFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(targetFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium mb-2">
                  {isTargetDragActive ? 'Drop your track here' : 'Drag & drop your track'}
                </p>
                <p className="text-gray-400 text-sm">or click to browse</p>
                <p className="text-gray-500 text-xs mt-2">WAV, MP3, FLAC, AIFF</p>
              </div>
            )}
          </div>
        </div>

        {/* Reference File Upload or YouTube URL */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            {masteringMode === 'reference' ? 'Reference Track' : 'Mastering Settings'}
          </h3>
          
          {masteringMode === 'reference' ? (
            <div>
              {/* YouTube URL Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Or paste a YouTube URL:
                </label>
                <div className="flex">
                  <Youtube className="h-5 w-5 text-red-500 mt-3 mr-2" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* File Upload */}
              <div className="text-center text-gray-400 text-sm mb-3">OR</div>
              
              <div
                {...getReferenceRootProps()}
                className={`dropzone ${isReferenceDragActive ? 'active' : ''} ${
                  referenceFile ? 'accept' : ''
                }`}
              >
                <input {...getReferenceInputProps()} />
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {referenceFile ? (
                  <div>
                    <p className="text-green-400 font-medium">{referenceFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium mb-2">
                      {isReferenceDragActive ? 'Drop reference here' : 'Drag & drop reference track'}
                    </p>
                    <p className="text-gray-400 text-sm">or click to browse</p>
                    <p className="text-gray-500 text-xs mt-2">WAV, MP3, FLAC, AIFF</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="text-center mb-6">
                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Standalone Mastering</p>
                <p className="text-gray-400 text-sm">
                  Your track will be mastered using professional algorithms without reference matching.
                </p>
              </div>
              
              {/* Genre Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Music Genre:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'pop', label: 'Pop', color: 'bg-pink-500' },
                    { value: 'rock', label: 'Rock', color: 'bg-red-500' },
                    { value: 'electronic', label: 'Electronic', color: 'bg-purple-500' },
                    { value: 'hip-hop', label: 'Hip-Hop', color: 'bg-orange-500' },
                    { value: 'jazz', label: 'Jazz', color: 'bg-blue-500' },
                    { value: 'classical', label: 'Classical', color: 'bg-indigo-500' },
                    { value: 'country', label: 'Country', color: 'bg-green-500' },
                    { value: 'blues', label: 'Blues', color: 'bg-cyan-500' },
                    { value: 'folk', label: 'Folk', color: 'bg-yellow-500' }
                  ].map((genre) => (
                    <button
                      key={genre.value}
                      onClick={() => setSelectedGenre(genre.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedGenre === genre.value
                          ? `${genre.color} text-white`
                          : 'bg-white/20 text-gray-300 hover:bg-white/30'
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Genre selection helps optimize mastering parameters for your music style.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Process Button */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <button
          onClick={startMastering}
          disabled={!targetFile || (masteringMode === 'reference' && !referenceFile && !youtubeUrl) || isProcessing}
          className="btn-primary text-white px-8 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Start ${masteringMode === 'reference' ? 'Reference' : `${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Standalone`} Mastering`}
        </button>
      </motion.div>

      {/* Progress Section */}
      {isProcessing && jobStatus && (
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Processing Status</h3>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${jobStatus.progress}%` }}
            />
          </div>
          <p className="text-gray-300 mt-2">{jobStatus.message}</p>
          <p className="text-sm text-gray-400 mt-1">{jobStatus.progress}% complete</p>
        </motion.div>
      )}


      {/* Results Section */}
      {jobStatus?.status === 'completed' && (
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Mastering Complete!</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {jobStatus.output_files?.map((filename, index) => {
              let formatLabel = 'Audio File';
              if (filename.includes('.mp3')) {
                formatLabel = 'MP3 (320kbps)';
              } else if (filename.includes('pcm16')) {
                formatLabel = 'WAV 16-bit';
              } else if (filename.includes('pcm24')) {
                formatLabel = 'WAV 24-bit';
              }
              
              return (
                <div key={index} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{formatLabel}</p>
                    <p className="text-sm text-gray-400">{filename}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(filename)}
                    className="btn-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.div 
        className="mt-16 grid md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="text-center">
          <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
          <p className="text-gray-300">
            Advanced algorithms analyze and match your track to the reference with professional quality.
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Reference Matching</h3>
          <p className="text-gray-300">
            Match RMS, frequency response, peak amplitude, and stereo width to any reference track.
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Download className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Multiple Formats</h3>
          <p className="text-gray-300">
            Get your mastered track in 16-bit and 24-bit WAV formats for maximum compatibility.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
