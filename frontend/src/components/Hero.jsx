import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import ThreeOrb from './ThreeOrb';

const Hero = ({ currentEmotion, onStartClick }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* 3D Orb Background Elements */}
      <ThreeOrb currentEmotion={currentEmotion} />

      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonBlue/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pinkGlow/10 rounded-full blur-[150px]" />

      {/* Floating Particles (Simplified for example) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-neonBlue" />
            <span className="text-sm font-medium text-gray-200">AI-Powered Emotion Detection</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
            Feel the Music Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-pinkGlow to-neonBlue animate-pulse-slow">
              Mood Deserves
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
            VibeSync translates your real-time feelings into the perfect soundtrack. 
            Turn on your camera, let our AI read the room, and immerse yourself.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={onStartClick}
              className="w-full sm:w-auto relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-neonBlue rounded-full blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative w-full px-8 py-4 bg-background rounded-full leading-none flex items-center justify-center gap-2 text-white font-semibold transition-transform hover:scale-[0.98]">
                <span>Start Detecting</span>
                <Play className="w-4 h-4 fill-white" />
              </div>
            </button>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full glass hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white font-medium">
              <span>Explore Moods</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom Gradient overlay for smooth transition */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
