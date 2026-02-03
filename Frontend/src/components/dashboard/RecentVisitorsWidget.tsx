import React, { useEffect, useState } from 'react';
import { visitorApi } from '../../api/visitorApi';
import type { Visitor } from '../../types/visitor.types';

const RecentVisitorsWidget: React.FC = () => {
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

  if (loading) return <div className="rounded-lg border bg-white p-4 animate-pulse h-32" />;

  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="font-semibold text-gray-900">Visitantes recientes</h3>
      <ul className="mt-3 space-y-2">
        {visitors.map((v) => (
          <li key={v.id} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div>
              <p className="text-sm font-medium text-gray-900">{v.name} {v.lastName}</p>
              <p className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
        {visitors.length === 0 && <p className="text-sm text-gray-500">Sin registros recientes</p>}
      </ul>
    </div>
  );
};

export default RecentVisitorsWidget;
