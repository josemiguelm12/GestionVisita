import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { statsApi } from '../../api/statsApi';
import type { DepartmentStats } from '../../types/stats.types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#111827', '#374151', '#6b7280', '#9ca3af',
  '#1f2937', '#4b5563', '#d1d5db', '#52525b',
  '#3f3f46', '#71717a',
];

const VisitChart: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    statsApi.getByDepartment()
      .then((res) => { if (mounted) setData(res); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className={`rounded-3xl border p-6 animate-pulse h-80 ${
    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }`} />;

  const hasData = data.length > 0;

  return (
    <div className={`rounded-3xl border p-6 ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`mb-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Visitas por departamento</h3>
      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="visits"
                nameKey="department"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={2}
                label={({ percent }: any) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#f1f5f9' : '#111827',
                }}
                formatter={(value: any, name: any) => [`${value} visitas`, name]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No hay datos de visitas por departamento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitChart;
