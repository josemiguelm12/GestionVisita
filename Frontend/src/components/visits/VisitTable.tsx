import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import type { Visit } from '../../types/visit.types';
import { formatDateTime } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface VisitTableProps {
  visits: Visit[];
  onClose?: (visit: Visit) => void;
}

const VisitTable: React.FC<VisitTableProps> = ({ visits, onClose }) => {
  const { theme } = useTheme();

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      Abierto: { label: 'Activa', className: 'bg-green-100 text-green-800' },
      Cerrado: { label: 'Cerrada', className: 'bg-gray-100 text-gray-800' },
      Cancelado: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config =
      status && statusMap[status]
        ? statusMap[status]
        : {
            label: status ?? 'Sin estado',
            className: 'bg-gray-100 text-gray-800',
          };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const calculateDuration = (createdAt: string, endAt: string | null) => {
    const start = new Date(createdAt);
    const end = endAt ? new Date(endAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}>
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Visitantes</th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Persona a visitar</th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Departamento</th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Motivo</th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Hora entrada</th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Duración</th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Estado</th>
            <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Acciones</th>
          </tr>
        </thead>

        <tbody className={`divide-y ${theme === 'dark' ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'}`}>
          {visits.map((visit) => {
            const visitorsList = Array.isArray(visit.visitors) ? visit.visitors : [];

            const visitorsText =
              visitorsList.length > 0
                ? visitorsList.map((v: any) => `${v.name} ${v.lastName}`).join(', ')
                : '-';

            return (
              <tr key={visit.id} className={theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}>
                <td className={`px-4 py-3 text-sm font-medium ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {visitorsText}
                </td>

                <td className={`px-4 py-3 text-sm ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {visit.namePersonToVisit}
                </td>

                <td className={`px-4 py-3 text-sm ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {visit.department}
                </td>

                <td className={`px-4 py-3 text-sm max-w-xs truncate ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {visit.reason || '-'}
                </td>

                <td className={`px-4 py-3 text-sm ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {formatDateTime(visit.createdAt)}
                </td>

                <td className={`px-4 py-3 text-sm ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {calculateDuration(visit.createdAt, visit.endAt)}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {getStatusBadge(visit.statusName)}
                </td>

                <td className="px-4 py-3 text-right text-sm font-medium">
                  {visit.statusName === 'Abierto' && onClose && (
                    <button
                      onClick={() => onClose(visit)}
                      className={`inline-flex items-center gap-1 transition ${ theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Cerrar
                    </button>
                  )}

                  {visit.statusName === 'Cerrado' && (
                    <span className={`text-xs ${ theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Cerrada</span>
                  )}
                </td>
              </tr>
            );
          })}

          {visits.length === 0 && (
            <tr>
              <td colSpan={8} className={`px-4 py-8 text-center ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No se encontraron visitas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VisitTable;
