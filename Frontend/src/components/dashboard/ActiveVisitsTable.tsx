import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { visitApi } from '../../api/visitApi';
import type { Visit } from '../../types/visit.types';

const ActiveVisitsTable: React.FC = () => {
  const { theme } = useTheme();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<number | null>(null);

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

  const handleClose = async (visitId: number) => {
    if (!confirm('¿Registrar salida de esta visita?')) return;
    
    setClosingId(visitId);
    try {
      await visitApi.close(visitId);
      // Recargar la lista
      const data = await visitApi.getActive();
      setVisits(data);
    } catch (error) {
      console.error('Error al cerrar visita:', error);
      alert('Error al registrar la salida');
    } finally {
      setClosingId(null);
    }
  };

  if (loading) {
    return <div className={`rounded-3xl border p-6 animate-pulse h-32 ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`} />;
  }

  return (
    <div className={`rounded-3xl border overflow-hidden ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-6 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Visitas activas</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className={theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Visitante</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Hora entrada</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Motivo</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className={`border-t transition ${
                theme === 'dark'
                  ? 'border-slate-700 hover:bg-slate-700/30'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {v.visitors?.map((vi) => `${vi.name} ${vi.lastName}`).join(', ')}
                </td>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(v.createdAt).toLocaleTimeString()}
                </td>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {v.reason ?? '-'}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleClose(v.id)}
                    disabled={closingId === v.id}
                    className="inline-flex items-center rounded-full bg-gradient-to-b from-gray-600 to-gray-800 px-4 py-2 text-sm text-white hover:from-gray-700 hover:to-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {closingId === v.id ? 'Registrando...' : 'Registrar salida'}
                  </button>
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td className={`px-6 py-8 text-center text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} colSpan={4}>No hay visitas activas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveVisitsTable;
