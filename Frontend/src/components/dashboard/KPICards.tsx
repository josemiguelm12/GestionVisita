import React, { useEffect, useState } from 'react';
import { statsApi } from '../../api/statsApi';
import { visitorApi } from '../../api/visitorApi';
import type { Stats } from '../../types/stats.types';
import { Users, Activity, CalendarClock, Timer } from 'lucide-react';

const Card: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={"h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center"}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const KPICards: React.FC = () => {
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
          <div key={i} className="rounded-lg border bg-white p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Visitantes registrados" value={totalVisitors} icon={<Users className="h-5 w-5 text-indigo-600" />} />
      <Card title="Visitas esta semana" value={stats?.weekVisits ?? 0} icon={<CalendarClock className="h-5 w-5 text-indigo-600" />} />
      <Card title="Visitas activas" value={stats?.activeVisits ?? 0} icon={<Activity className="h-5 w-5 text-indigo-600" />} />
      <Card title="Visitas hoy" value={stats?.todayVisits ?? 0} icon={<Timer className="h-5 w-5 text-indigo-600" />} />
    </div>
  );
};

export default KPICards;
