import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { visitApi } from '../api/visitApi';
import type { Visit, CreateVisitRequest } from '../types/visit.types';
import VisitTable from '../components/visits/VisitTable';
import VisitFormModal from '../components/visits/VisitFormModal';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const STATUS_MAP: Record<string, number | undefined> = {
  all: undefined,
  active: 1,
  closed: 2,
};

const Visits: React.FC = () => {
  const { theme } = useTheme();
  const { canCreateVisits, canCloseVisits } = usePermissions();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitToClose, setVisitToClose] = useState<Visit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const loadVisits = useCallback(async (page: number, query: string, status: string) => {
    try {
      setLoading(true);
      const response = await visitApi.getPaged(page, PAGE_SIZE, query || undefined, STATUS_MAP[status]);
      setVisits(response.data);
      setTotalItems(response.pagination.total);
    } catch (error) {
      toast.error('Error al cargar visitas');
      console.error(error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVisits(currentPage, search, filterStatus);
  }, [currentPage, search, filterStatus, loadVisits]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setCurrentPage(1);
  }, []);

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateVisitRequest) => {
    try {
      await visitApi.create(data);
      toast.success('Visita registrada exitosamente');
      setIsModalOpen(false);
      loadVisits(currentPage, search, filterStatus);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear visita');
      throw error;
    }
  };

  const handleClose = (visit: Visit) => {
    setVisitToClose(visit);
  };

  const confirmClose = async () => {
    if (!visitToClose) return;

    try {
      await visitApi.close(visitToClose.id);
      toast.success('Visita cerrada exitosamente');
      setVisitToClose(null);
      loadVisits(currentPage, search, filterStatus);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cerrar visita');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className={`text-4xl font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Visitas</h1>
        {canCreateVisits && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 transition"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
            Nueva Visita
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar por visitante, persona a visitar, departamento..."
            onSearch={handleSearch}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterStatus('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
              filterStatus === 'all'
                ? 'bg-gradient-to-b from-gray-600 to-gray-800 text-white'
                : theme === 'dark'
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => handleFilterStatus('active')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
              filterStatus === 'active'
                ? 'bg-gradient-to-b from-green-600 to-green-800 text-white'
                : theme === 'dark'
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => handleFilterStatus('closed')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
              filterStatus === 'closed'
                ? 'bg-gradient-to-b from-gray-600 to-gray-800 text-white'
                : theme === 'dark'
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Cerradas
          </button>
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <VisitTable visits={visits} onClose={canCloseVisits ? handleClose : undefined} />
            {totalPages > 1 && (
              <div className={`px-6 py-4 border-t ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <VisitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!visitToClose}
        title="Confirmar cierre de visita"
        message={`¿Está seguro que desea cerrar la visita${
          Array.isArray(visitToClose?.visitors) && visitToClose.visitors.length > 0
            ? ` de ${visitToClose.visitors.map((v) => `${v.name} ${v.lastName}`).join(', ')}`
            : ''
        }?`}
        confirmLabel="Cerrar visita"
        cancelLabel="Cancelar"
        variant="info"
        onConfirm={confirmClose}
        onCancel={() => setVisitToClose(null)}
      />
    </div>
  );
};

export default Visits;
