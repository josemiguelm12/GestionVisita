import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { visitorApi } from '../../api/visitorApi';
import type { Visitor } from '../../types/visitor.types';

const RecentVisitorsWidget: React.FC = () => {
  const { theme } = useTheme();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    visitorApi.getAll()
      .then((data) => {
        if (!mounted) return;
        const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setVisitors(sorted.slice(0, 5));
      })
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
      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Visitantes recientes</h3>
      <ul className="mt-5 space-y-4">
        {visitors.map((v) => (
          <li key={v.id} className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-slate-700 to-slate-600'
                : 'bg-gradient-to-b from-gray-100 to-gray-200'
            }`}>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{v.name[0]}{v.lastName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>{v.name} {v.lastName}</p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>{new Date(v.createdAt).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
        {visitors.length === 0 && (
          <p className={`text-sm py-4 text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>Sin registros recientes</p>
        )}
      </ul>
    </div>
  );
};

export default RecentVisitorsWidget;
