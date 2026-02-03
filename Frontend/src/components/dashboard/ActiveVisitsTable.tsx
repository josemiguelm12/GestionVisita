import React, { useEffect, useState } from 'react';
import { visitApi } from '../../api/visitApi';
import type { Visit } from '../../types/visit.types';

const ActiveVisitsTable: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await visitApi.getActive();
        if (mounted) setVisits(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return <div className="rounded-lg border bg-white p-4 animate-pulse h-32" />;
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Visitas activas</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Visitante</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Hora entrada</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Motivo</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2">
                  {v.visitors?.map((vi) => `${vi.name} ${vi.lastName}`).join(', ')}
                </td>
                <td className="px-4 py-2">{new Date(v.createdAt).toLocaleTimeString()}</td>
                <td className="px-4 py-2">{v.reason ?? '-'}</td>
                <td className="px-4 py-2">
                  {/* TODO: Acción de registrar salida */}
                  <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">Registrar salida</button>
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>No hay visitas activas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveVisitsTable;
