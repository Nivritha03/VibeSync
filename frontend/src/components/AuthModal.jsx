import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    const action = isLogin ? login : register;
    const result = await action(username, password);
    
    setIsSubmitting(false);
    
    if (result.success) {
      onClose();
      setUsername('');
      setPassword('');
      navigate('/app');
    } else {
      setError(result.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(''); // Clear error when toggling
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Draggable Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none font-sans">
            <motion.div 
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-[90%] max-w-md z-[101] pointer-events-auto cursor-grab active:cursor-grabbing"
            >
              <div className="glass p-8 rounded-3xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-pinkGlow to-neonBlue pointer-events-none" />
                
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-3xl font-bold text-white mb-2 select-none">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-sm mb-8 select-none">
                  {isLogin ? 'Sign in to access your emotion history and saved playlists.' : 'Join VibeSync to track emotions and customize recommendations.'}
                </p>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center text-red-500 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-surface/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()} // Allow selecting text
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="password"
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-surface/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()} // Allow selecting text
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-neonBlue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-opacity"
                  >
                    {isSubmitting ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                  </button>
                </form>
                
                <div className="mt-6 text-center select-none">
                  <button 
                    onClick={toggleMode}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
