import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Square, 
  FastForward, Rewind, Shuffle, Repeat, 
  Volume2, VolumeX, X
} from 'lucide-react';

const MusicPlayer = ({ playlist, currentIndex, onIndexChange, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const audioRef = useRef(null);
  
  const currentSong = playlist?.[currentIndex];

  useEffect(() => {
    if (!audioRef.current && typeof Audio !== "undefined") {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    // Auto-play when song changes
    if (currentSong?.audio) {
      audio.src = currentSong.audio;
      audio.volume = isMuted ? 0 : volume;
      audio.loop = isRepeat;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
      }
    }
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnd = () => {
      if (isRepeat) return; // audio.loop handles this automatically
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [currentIndex, currentSong]);

  // Effect to handle play/pause toggling
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Play failed", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Effect to handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Effect to handle repeat toggling
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = isRepeat;
  }, [isRepeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = () => setIsPlaying(prev => !prev);
  
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    onClose();
  };

  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      onIndexChange(randomIndex);
    } else {
      onIndexChange((currentIndex + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    if (!playlist || playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      onIndexChange(randomIndex);
    } else {
      onIndexChange((currentIndex - 1 + playlist.length) % playlist.length);
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleFastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-white/10 backdrop-blur-xl bg-black/60 shadow-2xl px-4 sm:px-8 py-3"
    >
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden cursor-pointer group">
        <input 
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="h-full bg-gradient-to-r from-primary to-neonBlue group-hover:from-neonBlue group-hover:to-pinkGlow transition-colors"
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        />
        <div 
          className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 6px)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 h-full">
        
        {/* Track Info (Left) */}
        <div className="flex items-center gap-4 w-full md:w-1/3 min-w-0">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden glass-card shadow-lg">
            <img 
              src={currentSong.image || 'https://via.placeholder.com/150'} 
              alt={currentSong.title} 
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-neonBlue animate-pulse" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-sm sm:text-base truncate group-hover:text-primary transition-colors cursor-default">
              {currentSong.title}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm truncate">
              {currentSong.artist}
            </div>
          </div>
        </div>

        {/* Main Controls (Center) */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/3 gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsShuffle(!isShuffle)} 
              className={`p-1 transition-colors ${isShuffle ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={handlePrev} className="text-gray-300 hover:text-white transition-colors" title="Previous">
              <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>
            <button onClick={handleRewind} className="text-gray-400 hover:text-white transition-colors hidden sm:block" title="Rewind 10s">
              <Rewind className="w-5 h-5" />
            </button>

            <button 
              onClick={handlePlayPause}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1 fill-current" />}
            </button>

            <button onClick={handleFastForward} className="text-gray-400 hover:text-white transition-colors hidden sm:block" title="Fast Forward 10s">
              <FastForward className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="text-gray-300 hover:text-white transition-colors" title="Next">
              <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>
            <button 
              onClick={() => setIsRepeat(!isRepeat)} 
              className={`p-1 transition-colors ${isRepeat ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
              title="Repeat"
            >
              <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {/* Time Display */}
          <div className="flex items-center justify-between w-full max-w-xs text-[10px] sm:text-xs text-gray-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Extra Controls (Right) */}
        <div className="flex items-center justify-end w-full md:w-1/3 gap-3 sm:gap-4 hidden md:flex">
          <div className="flex items-center gap-2 group">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="w-20 lg:w-28 relative h-1.5 bg-white/10 rounded-full overflow-hidden flex items-center">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (Number(e.target.value) > 0) setIsMuted(false);
                }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="h-full bg-white group-hover:bg-primary transition-colors"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>

          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <button 
            onClick={handleStop}
            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            title="Stop & Close"
          >
            <Square className="w-5 h-5 fill-current" />
            <span className="hidden lg:inline">Stop</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default MusicPlayer;
