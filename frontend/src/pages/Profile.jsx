import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, History, Music, BarChart, Settings, LogOut, Camera, Sliders, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
// import { Button } from "../components/ui/button"; 
// import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const { user, logout, API_URL } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    if (user) fetchHistory();
  }, [user, API_URL]);

  const stats = [
    { label: 'Scans', value: history.length, icon: <Camera />, color: 'blue' },
    { label: 'Top Mood', value: 'Happy', icon: <Music />, color: 'purple' },
    { label: 'Saved', value: 12, icon: <History />, color: 'pink' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
        <Navbar />
        
        <main className="w-full px-6 sm:px-12 lg:px-24 pt-32 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/10 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-neonBlue p-1">
                                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-3xl font-black">
                                    {user?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-zinc-900 rounded-full" />
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-1">{user}</h2>
                        <p className="text-zinc-500 text-sm mb-6">Premium Member</p>
                        
                        <nav className="space-y-2 text-left">
                            {[
                                { id: 'overview', icon: <User className="w-4 h-4" />, label: 'Overview' },
                                { id: 'security', icon: <Shield className="w-4 h-4" />, label: 'Security' },
                                { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                                        activeTab === item.id 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                        
                        <button 
                            onClick={logout}
                            className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-white/5 rounded-lg text-primary">
                                        {stat.icon}
                                    </div>
                                    <BarChart className="w-4 h-4 text-zinc-700" />
                                </div>
                                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* History / Activity */}
                    <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Recent Activity</h3>
                        <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline bg-transparent border-none cursor-pointer">View All</button>
                        </div>
                        <div className="p-0">
                            {history.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {history.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                                    <Music className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)} Session</div>
                                                    <div className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-neonBlue">Rec: "{item.emotion}"</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <History className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                    <p className="text-zinc-500">No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Section (Example of tab content) */}
                    {activeTab === 'security' && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="glass p-8 rounded-[2.5rem] border border-white/10"
                        >
                            <h3 className="text-xl font-bold mb-6">Security Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Protection Level
                                    </h4>
                                    <p className="text-sm text-zinc-400 mb-4">Your account is using JWT-based secure authentication.</p>
                                    <button className="w-full px-4 py-2 rounded-xl bg-transparent border border-zinc-800 text-white hover:bg-white/5 transition-all">Change Password</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
};

export default Profile;
