import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import type { Visit } from '../../types/visit.types';
import { formatDateTime } from '../../utils/formatters';

interface VisitTableProps {
  visits: Visit[];
  onClose: (visit: Visit) => void;
}

const VisitTable: React.FC<VisitTableProps> = ({ visits, onClose }) => {

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
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitantes</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Persona a visitar</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora entrada</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {visits.map((visit) => {
            const visitorsList = Array.isArray(visit.visitors) ? visit.visitors : [];

            const visitorsText =
              visitorsList.length > 0
                ? visitorsList.map((v: any) => `${v.name} ${v.lastName}`).join(', ')
                : '-';

            return (
              <tr key={visit.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {visitorsText}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900">
                  {visit.namePersonToVisit}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {visit.department}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {visit.reason || '-'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDateTime(visit.createdAt)}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {calculateDuration(visit.createdAt, visit.endAt)}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {getStatusBadge(visit.statusName)}
                </td>

                <td className="px-4 py-3 text-right text-sm font-medium">
                  {visit.statusName === 'Abierto' && (
                    <button
                      onClick={() => onClose(visit)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Cerrar
                    </button>
                  )}

                  {visit.statusName === 'Cerrado' && (
                    <span className="text-gray-400 text-xs">Cerrada</span>
                  )}
                </td>
              </tr>
            );
          })}

          {visits.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
