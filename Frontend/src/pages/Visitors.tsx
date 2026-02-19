import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { visitorApi } from '../api/visitorApi';
import type { Visitor, CreateVisitorRequest } from '../types/visitor.types';
import VisitorTable from '../components/visitors/VisitorTable';
import VisitorFormModal from '../components/visitors/VisitorFormModal';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';

const Visitors: React.FC = () => {
  const { theme } = useTheme();
  const { canCreateVisitors, canEditVisitors, canDeleteVisitors } = usePermissions();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const data = await visitorApi.getAll();
      setVisitors(data);
      setFilteredVisitors(data);
    } catch (error) {
      toast.error('Error al cargar visitantes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredVisitors(visitors);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = visitors.filter(
      (v) =>
        v.name.toLowerCase().includes(lowerQuery) ||
        v.lastName.toLowerCase().includes(lowerQuery) ||
        v.identityDocument?.toLowerCase().includes(lowerQuery) ||
        v.email?.toLowerCase().includes(lowerQuery) ||
        v.institution?.toLowerCase().includes(lowerQuery)
    );
    setFilteredVisitors(filtered);
  };

  const handleCreate = () => {
    setSelectedVisitor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const handleView = (visitor: Visitor) => {
    // TODO: Implementar vista de detalles
    toast.success(`Ver detalles de ${visitor.name} ${visitor.lastName}`);
  };

  const handleDelete = (visitor: Visitor) => {
    setVisitorToDelete(visitor);
  };

  const confirmDelete = async () => {
    if (!visitorToDelete) return;

    try {
      await visitorApi.delete(visitorToDelete.id);
      toast.success('Visitante eliminado exitosamente');
      setVisitorToDelete(null);
      loadVisitors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar visitante');
    }
  };

  const handleSubmit = async (data: CreateVisitorRequest) => {
    try {
      if (selectedVisitor) {
        await visitorApi.update(selectedVisitor.id, data);
        toast.success('Visitante actualizado exitosamente');
      } else {
        await visitorApi.create(data);
        toast.success('Visitante creado exitosamente');
      }
      setIsModalOpen(false);
      setSelectedVisitor(null);
      loadVisitors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar visitante');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className={`text-4xl font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Visitantes</h1>
        {canCreateVisitors && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 transition"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
            Nuevo Visitante
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar por nombre, documento, email..."
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <VisitorTable
          visitors={filteredVisitors}
          onEdit={canEditVisitors ? handleEdit : undefined}
          onDelete={canDeleteVisitors ? handleDelete : undefined}
          onView={handleView}
        />
      </div>

      <VisitorFormModal
        isOpen={isModalOpen}
        visitor={selectedVisitor}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisitor(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!visitorToDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro que desea eliminar a ${visitorToDelete?.name} ${visitorToDelete?.lastName}?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setVisitorToDelete(null)}
      />
    </div>
  );
};

export default Visitors;
