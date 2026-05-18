import React from 'react';
import { Code, MessageCircle, Camera, Heart, Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background pt-16 pb-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full px-6 sm:px-16 lg:px-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-neonBlue flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-wide text-white">Vibe<span className="text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-primary">Sync</span></span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              AI-powered emotion detection that recommends music based on your real-time feelings. Feel the music your mood deserves.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Code className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-twitter transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-pinkGlow transition-colors">
                <Camera className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Product</h3>
            <ul className="space-y-3">
              <li><a href="#detect" className="text-gray-400 hover:text-primary transition-colors">Emotion Detection</a></li>
              <li><a href="#recommendations" className="text-gray-400 hover:text-primary transition-colors">Smart Playlists</a></li>
              <li><a href="#analytics" className="text-gray-400 hover:text-primary transition-colors">Mood Tracking</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} VibeSync. All rights reserved.</p>
          <p className="flex items-center mt-4 md:mt-0">
            Made with <Heart className="w-4 h-4 mx-1 text-pinkGlow" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
