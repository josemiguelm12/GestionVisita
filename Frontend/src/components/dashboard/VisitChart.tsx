import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { statsApi } from '../../api/statsApi';
import type { VisitsByDate } from '../../types/stats.types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const VisitChart: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<VisitsByDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    statsApi.getVisitsByDate(7)
      .then((res) => { if (mounted) setData(res); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className={`rounded-3xl border p-6 animate-pulse h-80 ${
    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }`} />;

  return (
    <div className={`rounded-3xl border p-6 ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`mb-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Visitas últimos 7 días</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} allowDecimals={false} />
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#475569' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#f1f5f9' : '#111827'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke={theme === 'dark' ? '#94a3b8' : '#4b5563'} 
              strokeWidth={2} 
              dot={{ fill: theme === 'dark' ? '#64748b' : '#374151', r: 4 }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisitChart;
