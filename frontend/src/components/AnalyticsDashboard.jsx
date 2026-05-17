import React, { useState, useEffect, useContext } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EMOTIONS = ['Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Neutral', 'Disgust'];
const COLORS = {
  Happy: '#00f0ff',
  Sad: '#b145ff',
  Angry: '#ef4444',
  Fear: '#5a3dff',
  Surprise: '#ff007f',
  Neutral: '#ffffff50',
  Disgust: '#22c55e'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/10 text-sm">
        <p className="text-white mb-2 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const { API_URL } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(`${API_URL}/analytics/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        processHistoryData(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [API_URL]);

  const processHistoryData = (history) => {
    if (!history || history.length === 0) return;

    // 1. Process for Pie Chart (Distribution)
    const counts = {};
    history.forEach(item => {
      counts[item.emotion] = (counts[item.emotion] || 0) + 1;
    });

    const dist = Object.keys(counts).map(name => ({
      name,
      value: counts[name],
      color: COLORS[name] || '#94a3b8'
    }));
    setDistribution(dist);

    // 2. Process for Area Chart (Trends over time)
    // Group by day/hour or just show last 10 entries linearly for simplicity in this view
    // Here we'll group by "recent session" (just index) for a timeline feel
    const timeline = [...history].reverse().map((item, idx) => {
      const date = new Date(item.timestamp);
      return {
        name: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        [item.emotion]: 1, // binary indicator for the chart
        full_emotion: item.emotion
      };
    });
    
    // For a smoother area chart, we can show cumulative or just discrete
    // Let's do a more useful "rolling" summary or just actual points
    setData(timeline);
  };

  if (loading) return (
    <div className="py-20 text-center text-gray-400">Loading your emotional data...</div>
  );

  if (data.length === 0) return (
    <div className="py-20 text-center text-gray-400 glass rounded-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">No History Yet</h2>
      <p>Start detecting your mood to see your personalized analytics here.</p>
    </div>
  );

  return (
    <section id="analytics" className="py-20 relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Your Mood Timeline</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This data is personalized to you, tracking how your emotions evolve as you listen to music.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Recent Emotional Journey</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {EMOTIONS.map(emo => (
                      <linearGradient key={emo} id={`color${emo}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[emo]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS[emo]} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 1.2]} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {EMOTIONS.map(emo => (
                    <Area 
                      key={emo}
                      type="monotone" 
                      dataKey={emo} 
                      stackId="1" 
                      stroke={COLORS[emo]} 
                      fillOpacity={1} 
                      fill={`url(#color${emo})`} 
                      strokeWidth={2}
                      connectNulls={true}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">Evolution of your last 50 mood detections (Oldest to Newest)</p>
          </motion.div>

          {/* Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold text-white mb-2">Mood Distribution</h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-gray-300 text-sm ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
