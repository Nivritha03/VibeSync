import React, { useRef, useState, useCallback, useContext, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, AlertCircle, CheckCircle2, RefreshCw, Activity } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EmotionDetector = ({ onEmotionDetected }) => {
  const webcamRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [emotion, setEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  
  const { API_URL } = useContext(AuthContext);

  const detectEmotion = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setIsDetecting(true);
    setError(null);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error("Could not capture webcam image. Please check camera permissions.");
      }

      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.post(`${API_URL}/detect-emotion`, 
        { image: imageSrc },
        { headers }
      );
      
      const data = response.data;
      
      if (data.error) {
        setError(data.error);
        setIsDetecting(false);
        return;
      }
      
      if (data.emotion && data.emotion !== "None") {
        setEmotion(data.emotion);
        setConfidence(data.confidence || 0);
        setIsCameraActive(false); // STOP CAMERA after successful detection
        if (onEmotionDetected) onEmotionDetected(data);
      } else {
        // Specifically handle "neutral" but 0 confidence case as "not found"
        setError("Could not identify an emotion clearly. Please ensure your face is visible.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Detection failed.";
      setError(msg);
      console.error("Detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  }, [onEmotionDetected, API_URL]);

  // AUTO-START DETECTION on load/camera activation
  useEffect(() => {
    let timer;
    if (isCameraActive && !emotion && !isDetecting && !error) {
        timer = setTimeout(() => {
            detectEmotion();
        }, 3000); // 3 seconds delay for camera to stabilize
    }
    return () => clearTimeout(timer);
  }, [isCameraActive, emotion, detectEmotion, isDetecting, error]);

  const handleReset = () => {
    setEmotion(null);
    setConfidence(0);
    setError(null);
    setIsCameraActive(true);
    setIsDetecting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col items-center">
        
        {/* Detection Status Header */}
        <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
                {isCameraActive ? "AI Scanning..." : "Vibe Synced!"}
            </h2>
            <p className="text-gray-400">
                {isCameraActive 
                    ? "Our AI is analyzing your facial expressions." 
                    : "Music recommendations based on your current mood."}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch w-full">
          
          {/* Action Column: Camera or Results */}
          <div className="relative group">
            <div className={`relative aspect-video rounded-3xl overflow-hidden border-2 transition-all duration-500 ${isCameraActive ? 'border-primary/50 shadow-[0_0_30px_rgba(177,69,255,0.2)]' : 'border-green-500/30'}`}>
              
                <AnimatePresence mode="wait">
                    {isCameraActive ? (
                        <motion.div 
                            key="webcam"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full bg-black relative"
                        >
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover scale-x-[-1]"
                                videoConstraints={{ facingMode: "user" }}
                            />
                            
                            {/* Scanning UI overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 border-[40px] border-black/20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/40 rounded-full animate-pulse" />
                                
                                {isDetecting && (
                                    <motion.div 
                                        className="absolute inset-x-0 h-1 bg-primary/80 shadow-[0_0_15px_rgba(177,69,255,1)]"
                                        animate={{ top: ['10%', '90%', '10%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="static-result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Detection Complete</h3>
                            <p className="text-gray-400 text-sm mb-6">Camera disabled for privacy.</p>
                            
                            <button 
                                onClick={handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Recommend Songs Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Float Badge */}
            <div className="absolute -top-4 -right-4 glass px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 shadow-xl z-20">
                <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {isCameraActive ? "Live AI Sensor" : "Sensor Offline"}
                </span>
            </div>
          </div>

      {/* Result Column */}
          <div className="flex flex-col justify-center gap-6">
            <motion.div 
                className={`glass p-8 rounded-3xl border-l-4 transition-all duration-500 ${
                    emotion === 'Happy' ? 'border-yellow-400 bg-yellow-400/5' :
                    emotion === 'Sad' ? 'border-blue-400 bg-blue-400/5' :
                    emotion === 'Angry' ? 'border-red-500 bg-red-500/5' :
                    emotion ? 'border-primary bg-primary/5' : 'border-white/10'
                }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Mood Status</span>
                        <h3 className="text-2xl font-bold text-white">Analysis</h3>
                    </div>
                </div>

                {emotion ? (
                    <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white">{emotion}</span>
                            <span className="text-sm font-medium text-gray-400">({(confidence * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-primary to-neonBlue"
                                initial={{ width: 0 }}
                                animate={{ width: `${confidence * 100}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-6 flex flex-col items-center text-center">
                        {isDetecting ? (
                            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                        ) : (
                            <ScanFace className="w-12 h-12 text-primary/40 mb-3" />
                        )}
                        <p className="text-sm text-gray-400">
                            {isDetecting ? "Processing facial markers..." : "Align your face in the camera."}
                        </p>
                        {!isDetecting && isCameraActive && (
                            <button 
                                onClick={detectEmotion}
                                className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/40 text-primary text-xs font-bold rounded-lg border border-primary/30 transition-all"
                            >
                                SCAN NOW
                            </button>
                        )}
                    </div>
                )}
            </motion.div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex flex-col gap-3"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Scanning Error</p>
                            <p className="opacity-80 ">{error}</p>
                        </div>
                    </div>
                    {/* If we have detail/traceback from backend, show a snippet */}
                    {typeof error === 'string' && error.includes('500') && (
                        <p className="text-[10px] opacity-60 font-mono bg-black/40 p-2 rounded">
                            Server-side error occurred. Resetting the camera may help.
                        </p>
                    )}
                    <button 
                        onClick={handleReset} 
                        className="flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold transition-all"
                    >
                        <RefreshCw className="w-3 h-3" /> Reset & Try Again
                    </button>
                </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;
