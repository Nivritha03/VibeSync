import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Music2, MoreHorizontal, Pause } from 'lucide-react';

const MusicRecommendations = ({ songs, emotion }) => {
  const [playingIndex, setPlayingIndex] = useState(null);

  if (!songs || songs.length === 0) {
    return null; // Don't render until we have songs
  }

  return (
    <section id="recommendations" className="py-20 relative">
      <div className="w-full px-6 sm:px-16 lg:px-32">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-2 text-primary font-medium tracking-wide">
            <Music2 className="w-5 h-5" />
            <span>AI CURATED PLAYLIST</span>
          </div>
          <h2 className="text-4xl font-bold text-white">
            Because you're feeling <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-neonBlue">{emotion}</span>
          </h2>
        </div>

        {/* Horizontal Scroll Carousel */}
        <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x no-scrollbar">
          {songs.map((song, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="snap-start min-w-[280px] md:min-w-[320px] p-5 glass-card group cursor-pointer hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={song.image} 
                  alt={song.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button 
                    onClick={() => setPlayingIndex(playingIndex === index ? null : index)}
                    className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(177,69,255,0.6)] hover:scale-110 transition-transform"
                  >
                    {playingIndex === index ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 ml-1 fill-white" />}
                  </button>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:text-pinkGlow transition-colors hover:bg-black/70">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors truncate">{song.title}</h3>
                <p className="text-gray-400 text-sm">{song.artist}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 backdrop-blur">
                    {emotion} Mix
                  </span>
                  {playingIndex === index && (
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-4 bg-neonBlue animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-2 bg-pinkGlow animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MusicRecommendations;
