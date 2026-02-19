import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { statsApi } from '../../api/statsApi';
import { visitorApi } from '../../api/visitorApi';
import type { Stats } from '../../types/stats.types';
import { Users, Activity, CalendarClock, Timer } from 'lucide-react';

const Card: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`rounded-3xl border p-6 transition ${
      theme === 'dark'
        ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`mt-2 text-3xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-slate-700 to-slate-600'
            : 'bg-gradient-to-b from-gray-100 to-gray-200'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const KPICards: React.FC = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [statsData, visitorsData] = await Promise.all([
          statsApi.getStats(),
          visitorApi.getAll()
        ]);
        if (mounted) {
          setStats(statsData);
          setTotalVisitors(visitorsData.length);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`rounded-3xl border p-6 animate-pulse h-28 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Visitantes registrados" value={totalVisitors} icon={<Users className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} strokeWidth={2} />} />
      <Card title="Visitas esta semana" value={stats?.weekVisits ?? 0} icon={<CalendarClock className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} strokeWidth={2} />} />
      <Card title="Visitas activas" value={stats?.activeVisits ?? 0} icon={<Activity className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} strokeWidth={2} />} />
      <Card title="Visitas hoy" value={stats?.todayVisits ?? 0} icon={<Timer className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} strokeWidth={2} />} />
    </div>
  );
};

export default KPICards;
