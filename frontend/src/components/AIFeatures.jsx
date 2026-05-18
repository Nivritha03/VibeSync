import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity, Headphones, Zap } from 'lucide-react';

const features = [
  {
    title: 'Real-time Emotion Detection',
    description: 'Advanced neural networks analyze micro-expressions to understand your precise emotional state instantly.',
    icon: <ScanFace className="w-6 h-6" />,
    color: 'from-primary to-neonBlue'
  },
  {
    title: 'Personalized Music',
    description: 'Dynamic algorithms that match acoustic properties, tempo, and lyrics to complement or elevate your mood.',
    icon: <Headphones className="w-6 h-6" />,
    color: 'from-pinkGlow to-primary'
  },
  {
    title: 'Mood Tracking Analytics',
    description: 'Visualize your emotional wellness over time with beautiful, interactive timeline charts.',
    icon: <Activity className="w-6 h-6" />,
    color: 'from-neonBlue to-primary'
  },
  {
    title: 'Smart Playlist Generation',
    description: 'Automatically construct seamless playlists designed to guide you from one emotional state to another.',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-primary to-pinkGlow'
  },
  {
    title: 'AI Emotion Insights',
    description: 'Deep psychological insights based on your listening habits and emotional correlation history.',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-secondary to-neonBlue'
  },
  {
    title: 'Instant Adaptation',
    description: 'Music that adapts in real-time as your expression changes during the listening session.',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-pinkGlow to-neonBlue'
  }
];

// Added missing import
import { ScanFace } from 'lucide-react';

const AIFeatures = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="w-full px-6 sm:px-16 lg:px-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powered by Next-Gen AI</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            VibeSync combines state-of-the-art computer vision with deep musical analysis to create an unprecedented listening experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group h-full"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500`}></div>
              <div className="relative h-full glass p-8 rounded-2xl flex flex-col items-start bg-surface/50 hover:bg-surface/70 transition-colors">
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIFeatures;
