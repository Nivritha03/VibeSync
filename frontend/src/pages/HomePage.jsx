import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import AIFeatures from '../components/AIFeatures';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { AuthContext } from '../context/AuthContext';

function HomePage({ openAuthModal }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStartDetecting = () => {
    if (user) {
      navigate('/app');
    } else {
      openAuthModal();
    }
  };

  return (
    <main className="relative z-10 flex flex-col items-center">
      <Hero onStartClick={handleStartDetecting} />
      
      <section className="py-20 text-center flex flex-col items-center w-full px-6 sm:px-16 lg:px-32">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to find your vibe?</h2>
        {user ? (
          <button 
            onClick={() => navigate('/app')}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-neonBlue text-white font-semibold text-lg hover:shadow-[0_0_20px_rgba(177,69,255,0.6)] transition-all cursor-pointer"
          >
            Launch Emotion Detector
          </button>
        ) : (
          <button 
            onClick={openAuthModal}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-neonBlue text-white font-semibold text-lg hover:shadow-[0_0_20px_rgba(177,69,255,0.6)] transition-all cursor-pointer"
          >
            Log in to Start
          </button>
        )}
      </section>

      <AIFeatures />
    </main>
  );
}

export default HomePage;
