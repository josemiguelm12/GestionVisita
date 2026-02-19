import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import type { Visitor } from '../../types/visitor.types';
import { formatDate } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface VisitorTableProps {
  visitors: Visitor[];
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
  onView: (visitor: Visitor) => void;
}

const VisitorTable: React.FC<VisitorTableProps> = ({ visitors, onEdit, onDelete, onView }) => {
  const { theme } = useTheme();
  
  const getDocumentTypeLabel = (type: number) => {
    switch (type) {
      case 1: return 'Cédula';
      case 2: return 'Pasaporte';
      case 3: return 'Sin ID';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}>
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Nombre
            </th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Documento
            </th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Email
            </th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Teléfono
            </th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Institución
            </th>
            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Fecha registro
            </th>
            <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          theme === 'dark'
            ? 'bg-slate-800 divide-slate-700'
            : 'bg-white divide-gray-200'
        }`}>
          {visitors.map((visitor) => (
            <tr key={visitor.id} className={theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {visitor.name} {visitor.lastName}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>{visitor.identityDocument || 'N/A'}</div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{getDocumentTypeLabel(visitor.documentType)}</div>
              </td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {visitor.email || '-'}
              </td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {visitor.phone || '-'}
              </td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {visitor.institution || '-'}
              </td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {formatDate(visitor.createdAt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(visitor)}
                    className={`transition ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(visitor)}
                      className={`transition ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(visitor)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {visitors.length === 0 && (
            <tr>
              <td colSpan={7} className={`px-4 py-8 text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No se encontraron visitantes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorTable;
