import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const AudioPreview = ({ originalFile, masteredFile, jobId, outputFiles = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('original'); // 'original' or 'mastered'
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);

  const getAudioSrc = () => {
    if (currentTrack === 'original' && originalFile) {
      return URL.createObjectURL(originalFile);
    } else if (currentTrack === 'mastered' && jobId) {
      // Try to find the best available mastered file
      const mp3File = outputFiles.find(f => f.includes('.mp3'));
      const pcm24File = outputFiles.find(f => f.includes('pcm24'));
      const pcm16File = outputFiles.find(f => f.includes('pcm16'));
      
      const fileName = mp3File || pcm24File || pcm16File || 'mastered_pcm16.wav';
      return `http://localhost:8000/api/download/${jobId}/${fileName}`;
    }
    return null;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => {
      setIsLoading(true);
      setAudioError(null);
    };
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('Audio error:', e);
      setAudioError('Failed to load audio file');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentTrack]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      setAudioError('Playback failed');
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const resetToStart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadFile = (filename) => {
    const url = `http://localhost:8000/api/download/${jobId}/${filename}`;
    window.open(url, '_blank');
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Audio Preview</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentTrack('original')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentTrack === 'original'
                ? 'bg-blue-500 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setCurrentTrack('mastered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentTrack === 'mastered'
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Mastered
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={getAudioSrc()}
        preload="metadata"
        className="hidden"
      />

      {/* Error message */}
      {audioError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{audioError}</p>
        </div>
      )}

      {/* Waveform placeholder */}
      <div className="mb-4">
        <div className="w-full h-20 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">
            {isLoading ? 'Loading...' : audioError ? 'Audio Error' : 'Audio Waveform'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className="absolute top-0 w-4 h-4 bg-white rounded-full transform -translate-y-1 cursor-pointer"
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={resetToStart}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-blue-500"
          />
        </div>
      </div>

      {/* Download buttons */}
      {outputFiles.length > 0 && (
        <div className="mt-6 border-t border-white/20 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Download Mastered Files:</h4>
          <div className="flex flex-wrap gap-2">
            {outputFiles.map((filename) => (
              <button
                key={filename}
                onClick={() => downloadFile(filename)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>
                  {filename.includes('.mp3') ? 'MP3' : 
                   filename.includes('pcm24') ? 'WAV 24-bit' : 
                   filename.includes('pcm16') ? 'WAV 16-bit' : 
                   filename}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Track info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Currently playing: <span className="text-white font-medium">
            {currentTrack === 'original' ? 'Original Track' : 'Mastered Track'}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default AudioPreview;
