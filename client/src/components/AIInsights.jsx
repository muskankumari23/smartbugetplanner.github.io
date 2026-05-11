import { useState, useEffect } from 'react';
import api from '../api';
import { Sparkles, Lightbulb, Zap, Info } from 'lucide-react';

const AIInsights = ({ expenses }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await api.get('/expenses/insights');
        setInsights(data);
      } catch (error) {
        console.error('Error fetching AI insights', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [expenses]); // Re-fetch when expenses change

  if (loading) return (
    <div className="animate-pulse flex space-x-4 p-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="glass-card p-8 rounded-3xl overflow-hidden relative border-l-8 border-l-indigo-400">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles size={120} />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500 rounded-lg text-white">
          <Sparkles size={20} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">AI Financial Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-all group">
            <div className="mt-1 text-indigo-500 group-hover:scale-110 transition-transform">
              {insight.includes('Critical') ? <Zap size={20} className="text-red-500" /> : 
               insight.includes('Savings') ? <Lightbulb size={20} className="text-yellow-500" /> :
               <Info size={20} />}
            </div>
            <p className="text-sm font-semibold text-gray-700 leading-relaxed">
              {insight}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-indigo-100 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Powered by SmartBudget AI Engine</p>
        <button className="text-xs font-bold text-indigo-600 hover:underline">Learn more about your habits</button>
      </div>
    </div>
  );
};

export default AIInsights;
