import React, { useState } from 'react';
import { FileDown, Calendar, Filter, Download } from 'lucide-react';
import { visitApi } from '../api/visitApi';
import type { Visit } from '../types/visit.types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

type ReportType = 'visits' | 'visitors' | 'active' | 'closed';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('visits');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<Visit[]>([]);

  const generateReport = async () => {
  if (!startDate || !endDate) {
    toast.error('Debe seleccionar fecha de inicio y fin');
    return;
  }

  setLoading(true);

  try {
    const response = await visitApi.getAll();
    const data: Visit[] = response.data;

    const filtered = data.filter((visit: Visit) => {
      const visitDate = new Date(visit.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return visitDate >= start && visitDate <= end;
    });

    let finalData = filtered;

    if (reportType === 'active') {
      finalData = filtered.filter(
        (v: Visit) => v.statusName === 'Abierto'
      );
    } else if (reportType === 'closed') {
      finalData = filtered.filter(
        (v: Visit) => v.statusName === 'Cerrado'
      );
    }

    setReportData(finalData);
    toast.success(`Reporte generado: ${finalData.length} registros`);

  } catch (error) {
    toast.error('Error al generar reporte');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['ID', 'Visitantes', 'Persona a Visitar', 'Departamento', 'Fecha', 'Estado', 'Motivo'];
    const rows = reportData.map((visit) => [
      visit.id,
      Array.isArray(visit.visitors) 
        ? visit.visitors.map((v) => `${v.name} ${v.lastName}`).join('; ')
        : '-',
      visit.namePersonToVisit,
      visit.department,
      new Date(visit.createdAt).toLocaleString('es-DO'),
      typeof visit.statusName === 'string' ? visit.statusName : visit.statusName,
      visit.reason || '-'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_visitas_${startDate}_${endDate}.csv`;
    link.click();
    toast.success('Reporte exportado exitosamente');
  };

  const getStatusBadge = (status: string | null) => {
  const colors: Record<string, string> = {
    Abierto: 'bg-green-100 text-green-800',
    Cerrado: 'bg-gray-100 text-gray-800',
    Cancelado: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status && colors[status]
          ? colors[status]
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status ?? 'Sin estado'}
    </span>
  );
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reportes</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Reporte
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="visits">Todas las visitas</option>
              <option value="active">Visitas activas</option>
              <option value="closed">Visitas cerradas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : <FileDown className="h-4 w-4" />}
              Generar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Resultados ({reportData.length} registros)
            </h3>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitantes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Persona a visitar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{visit.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {Array.isArray(visit.visitors) && visit.visitors.length > 0
                        ? visit.visitors.map((v) => `${v.name} ${v.lastName}`).join(', ')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{visit.namePersonToVisit}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{visit.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(visit.createdAt).toLocaleString('es-DO')}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(visit.statusName)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {visit.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje inicial */}
      {reportData.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generar Reporte
          </h3>
          <p className="text-gray-500">
            Seleccione los filtros y haga clic en "Generar" para ver los resultados
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
