import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Music, Sliders, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import EmotionDetector from '../components/EmotionDetector';
import MusicRecommendations from '../components/MusicRecommendations';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const AppPage = () => {
  const [recommendation, setRecommendation] = useState(null);
  const { user } = useContext(AuthContext);

  const handleEmotionDetected = (data) => {
    console.log("Emotion detected payload:", data);
    // data is { emotion, confidence, songs, ... }
    setRecommendation(data);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative bg-black w-full overflow-x-hidden m-0">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neonBlue/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="w-screen px-6 sm:px-16 lg:px-32 space-y-12">
        {/* Hero Section */}
        <header className="text-center space-y-4 px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest mx-auto"
          >
            <Sparkles className="w-3 h-3" />
            AI Vibe Studio
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight"
          >
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-neonBlue">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto"
          >
            Our neural network is ready to sync with your emotions. Just look into the camera and let the music flow.
          </motion.p>
        </header>

        {/* Emotion Detection Section */}
        <section className="relative z-10">
          <EmotionDetector onEmotionDetected={handleEmotionDetected} />
        </section>

        {/* Action Results */}
        <AnimatePresence>
          {recommendation && recommendation.songs && recommendation.songs.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-4"
            >
              <MusicRecommendations 
                songs={recommendation.songs} 
                emotion={recommendation.emotion} 
              />
              
              <div className="max-w-4xl mx-auto mt-8">
                <div className="glass p-6 rounded-3xl border border-white/10">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-neonBlue" />
                        Audio Dynamics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Energy', val: 85, color: 'primary' },
                            { label: 'Acousticness', val: 20, color: 'neonBlue' },
                            { label: 'Danceability', val: 75, color: 'pinkGlow' }
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">{stat.label}</span>
                                    <span className="text-white font-bold">{stat.val}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full bg-primary`} style={{ width: `${stat.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Analytics Section - Anchor always exists for smooth navigation */}
        <section 
          id="analytics" 
          className="mt-20 pt-10 border-t border-white/5 min-h-[400px]"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Personalized Mood Timeline</h2>
                <p className="text-gray-500">Tracking your emotional journey through sound</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {recommendation ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AnalyticsDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center glass rounded-[3rem] border border-white/5"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No mood data yet</h3>
                <p className="text-gray-400 max-w-sm mx-auto">
                  Start your first emotion detection to unlock your personalized musical journey timeline.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default AppPage;
