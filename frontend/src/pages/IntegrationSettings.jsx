import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Copy, ShieldCheck, Zap, Globe, Database, ExternalLink, AlertCircle, Terminal } from 'lucide-react';
// import { Button } from "../components/ui/button";
import Navbar from '../components/Navbar';

const IntegrationSettings = () => {
  const [tokens, setTokens] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');

  useEffect(() => {
    // Load existing tokens from localStorage for demo
    const saved = localStorage.getItem('generatedTokens');
    if (saved) setTokens(JSON.parse(saved));
  }, []);

  const handleCreateToken = () => {
    if (!newTokenName) return;

    const token = {
      name: newTokenName,
      key: `vs_token_${Math.random().toString(36).substr(2, 24)}`, // Mock token format
      createdAt: new Date().toLocaleDateString(),
      lastUsed: 'Never'
    };

    const updatedTokens = [...tokens, token];
    setTokens(updatedTokens);
    localStorage.setItem('generatedTokens', JSON.stringify(updatedTokens));
    setNewTokenName('');
    setIsCreateModalOpen(false);
  };

  const deleteToken = (tokenKey) => {
    const updatedTokens = tokens.filter(t => t.key !== tokenKey);
    setTokens(updatedTokens);
    localStorage.setItem('generatedTokens', JSON.stringify(updatedTokens));
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />
      
      <main className="w-full px-6 sm:px-16 lg:px-32 pt-32 pb-20">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white mb-4"
          >
            Integration Settings
          </motion.h1>
          <p className="text-zinc-400 text-lg">Manage your API tokens and integrate VibeSync with your favorite tools.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* API Tokens Section */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-24 h-24 text-primary" />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">API Tokens</h2>
                  <p className="text-sm text-zinc-500">Authentication tokens for programmatic access</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Generate Token
                </button>
              </div>

              <div className="space-y-4">
                {tokens.length > 0 ? (
                  tokens.map((token) => (
                    <div key={token.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-white font-bold">{token.name}</h4>
                        <code className="text-xs text-primary font-mono block">
                          {token.key.substring(0, 10)}****************
                        </code>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Created: {token.createdAt}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Last Used: {token.lastUsed}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(token.key);
                            alert("Copied!");
                          }}
                          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteToken(token.key)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                    <Database className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500">No active API tokens found.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Config & Webhooks */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">CLI Config</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-6">Connect via terminal for advanced automation scripts.</p>
                <div className="bg-black/40 p-3 rounded-lg font-mono text-xs text-zinc-300 mb-4 select-all">
                    npm install -g vibesync-cli
                    <br />
                    vibesync login
                </div>
                <button className="w-full mt-4 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5 transition-all">Learn More</button>
              </div>

              <div className="glass p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Webhooks</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-6">Receive real-time notifications for mood changes.</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-sm text-zinc-400">Endpoint URL</span>
                        <span className="text-xs text-indigo-400 font-bold">NOT CONFIGURED</span>
                    </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5 transition-all">Setup Webhook</button>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
                <h3 className="text-white font-bold mb-4">Quick Links</h3>
                <nav className="space-y-1">
                    <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-sm text-zinc-400 hover:text-white transition-all">
                        <span>API Documentation</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-sm text-zinc-400 hover:text-white transition-all">
                        <span>Developer Console</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-sm text-zinc-400 hover:text-white transition-all">
                        <span>Security Best Practices</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </nav>
            </div>

            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl">
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Security Note</span>
                </div>
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                    NEVER share your API tokens publicly. If you suspect a token is compromised, delete it immediately and generate a new one.
                </p>
            </div>
          </div>
        </div>
      </main>

      {/* Create Token Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md relative z-[101] shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">New API Token</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Token Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Home Dashboard" 
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-primary transition-all"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-500 italic">Describe how this token will be used.</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-zinc-400 font-bold hover:text-white transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateToken}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationSettings;
