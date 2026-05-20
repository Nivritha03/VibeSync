import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Music2, Pause, Star } from 'lucide-react';
import MusicPlayer from './MusicPlayer';

const MusicRecommendations = ({ songs, emotion }) => {
  const [favorites, setFavorites] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState('recommendations'); // 'recommendations' or 'favorites'
  const [playingIndex, setPlayingIndex] = useState(null);

  // Load favorites from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vibeSyncFavorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Could not parse favorites");
      }
    }
  }, []);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('vibeSyncFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Reset playback if recommendations change
  useEffect(() => {
    if (activePlaylist === 'recommendations') {
      setPlayingIndex(null);
    }
  }, [songs, activePlaylist]);

  const toggleFavorite = (song) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.audio === song.audio);
      if (exists) {
        // Handle removals safely if they are currently playing
        if (activePlaylist === 'favorites' && playingIndex !== null) {
          const playingSong = prev[playingIndex];
          if (playingSong && playingSong.audio === song.audio) {
            setPlayingIndex(null);
          }
        }
        return prev.filter(f => f.audio !== song.audio);
      } else {
        return [...prev, song];
      }
    });
  };

  const isFavorite = (song) => {
    return favorites.some(f => f.audio === song.audio);
  };

  const currentSongs = activePlaylist === 'recommendations' ? songs : favorites;

  const handlePlayClick = (index, playlistType) => {
    if (activePlaylist === playlistType && playingIndex === index) {
      // Toggle pause (just close player for now or let player handle it)
      setPlayingIndex(null);
    } else {
      setActivePlaylist(playlistType);
      setPlayingIndex(index);
    }
  };

  if (!songs || songs.length === 0) {
    return null; // Don't render until we have songs
  }

  const renderCarousel = (list, playlistType, title, subtitle, icon) => {
    if (!list || list.length === 0) return null;
    
    return (
      <div className="mb-20">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-2 text-primary font-medium tracking-wide">
            {icon}
            <span>{subtitle}</span>
          </div>
          <h2 className="text-4xl font-bold text-white">
            {title}
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x no-scrollbar">
          {list.map((song, index) => {
            const isPlaying = activePlaylist === playlistType && playingIndex === index;
            const isFav = isFavorite(song);
            
            return (
              <motion.div
                key={song.audio + index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-start min-w-[280px] md:min-w-[320px] p-5 glass-card group cursor-pointer hover:-translate-y-2 transition-transform duration-300 relative"
              >
                <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={song.image} 
                    alt={song.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center backdrop-blur-sm ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button 
                      onClick={() => handlePlayClick(index, playlistType)}
                      className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(177,69,255,0.6)] hover:scale-110 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 ml-1 fill-white" />}
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(song); }}
                      className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-colors shadow-lg ${isFav ? 'bg-pinkGlow text-white hover:bg-pink-600' : 'bg-black/50 text-white hover:text-pinkGlow hover:bg-black/70'}`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 backdrop-blur">
                      {playlistType === 'recommendations' ? `${emotion} Mix` : 'Loved Track'}
                    </span>
                    {isPlaying && (
                      <div className="flex items-center gap-1 ml-auto">
                        <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-4 bg-neonBlue animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-2 bg-pinkGlow animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section id="recommendations" className="py-20 relative">
      <div className="w-full px-6 sm:px-16 lg:px-32">
        {/* Recommendations Section */}
        {renderCarousel(
          songs, 
          'recommendations', 
          <React.Fragment>Because you're feeling <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-neonBlue">{emotion}</span></React.Fragment>,
          'AI CURATED PLAYLIST',
          <Music2 className="w-5 h-5" />
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && renderCarousel(
          favorites,
          'favorites',
          'Your Favorite Tracks',
          'SAVED MUSIC',
          <Star className="w-5 h-5" />
        )}
      </div>

      {/* Global Music Player */}
      <AnimatePresence>
        {playingIndex !== null && (
          <MusicPlayer 
            playlist={currentSongs}
            currentIndex={playingIndex}
            onIndexChange={setPlayingIndex}
            onClose={() => setPlayingIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default MusicRecommendations;
