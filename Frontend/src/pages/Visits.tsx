import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { visitApi } from '../api/visitApi';
import type { Visit, CreateVisitRequest } from '../types/visit.types';
import VisitTable from '../components/visits/VisitTable';
import VisitFormModal from '../components/visits/VisitFormModal';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Visits: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitToClose, setVisitToClose] = useState<Visit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [visits, filterStatus]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await visitApi.getAll();
      setVisits(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar visitas');
      console.error(error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visits];

    if (filterStatus === 'active') {
      filtered = filtered.filter((v) => (typeof v.status === 'string' ? v.status : v.status.name) === 'Abierto');
    } else if (filterStatus === 'closed') {
      filtered = filtered.filter((v) => (typeof v.status === 'string' ? v.status : v.status.name) === 'Cerrado');
    }

    setFilteredVisits(filtered);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      applyFilters();
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = visits.filter(
      (v) =>
        v.namePersonToVisit?.toLowerCase().includes(lowerQuery) ||
        v.department?.toLowerCase().includes(lowerQuery) ||
        (Array.isArray(v.visitors) && v.visitors.some((visitor) =>
          `${visitor.name} ${visitor.lastName}`.toLowerCase().includes(lowerQuery)
        ))
    );
    setFilteredVisits(filtered);
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateVisitRequest) => {
    try {
      await visitApi.create(data);
      toast.success('Visita registrada exitosamente');
      setIsModalOpen(false);
      loadVisits();
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
      loadVisits();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cerrar visita');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeCount = (visits || []).filter((v) => (typeof v.status === 'string' ? v.status : v.status.name) === 'Abierto').length;
  const closedCount = (visits || []).filter((v) => (typeof v.status === 'string' ? v.status : v.status.name) === 'Cerrado').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Visitas</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Visita
        </button>
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
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({visits.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterStatus === 'closed'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cerradas ({closedCount})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <VisitTable visits={filteredVisits} onClose={handleClose} />
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
