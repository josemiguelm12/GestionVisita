import React, { useEffect, useState } from 'react';
import { statsApi } from '../../api/statsApi';
import type { VisitsByDate } from '../../types/stats.types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const VisitChart: React.FC = () => {
  const [data, setData] = useState<VisitsByDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    statsApi.getVisitsByDate(7)
      .then((res) => { if (mounted) setData(res); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="rounded-lg border bg-white p-4 animate-pulse h-64" />;

  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-2 font-semibold text-gray-900">Visitas últimos 7 días</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisitChart;
