import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { CreateVisitRequest } from '../../types/visit.types';
import type { Visitor } from '../../types/visitor.types';
import VisitorAutocomplete from './VisitorAutocomplete';
import VisitorFormModal from '../visitors/VisitorFormModal';
import type { CreateVisitorRequest } from '../../types/visitor.types';
import { visitorApi } from '../../api/visitorApi';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface VisitFormProps {
  onSubmit: (data: CreateVisitRequest) => Promise<void>;
  onCancel: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ onSubmit, onCancel }) => {
  const [selectedVisitors, setSelectedVisitors] = useState<Visitor[]>([]);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<CreateVisitRequest, 'visitorIds'>>({
    defaultValues: {
      missionCase: false,
      sendEmail: false,
    },
  });

  const handleVisitorSelect = (visitor: Visitor) => {
    if (!selectedVisitors.some((v) => v.id === visitor.id)) {
      setSelectedVisitors([...selectedVisitors, visitor]);
    }
  };

  const handleRemoveVisitor = (visitorId: number) => {
    setSelectedVisitors(selectedVisitors.filter((v) => v.id !== visitorId));
  };

  const handleCreateVisitor = async (data: CreateVisitorRequest) => {
    try {
      const newVisitor = await visitorApi.create(data);
      setSelectedVisitors([...selectedVisitors, newVisitor]);
      setIsVisitorModalOpen(false);
      toast.success('Visitante creado y agregado');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear visitante');
      throw error;
    }
  };

  const onFormSubmit = async (data: Omit<CreateVisitRequest, 'visitorIds'>) => {
    if (selectedVisitors.length === 0) {
      toast.error('Debe seleccionar al menos un visitante');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        visitorIds: selectedVisitors.map((v) => v.id),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visitantes <span className="text-red-500">*</span>
          </label>
          <VisitorAutocomplete
            onSelect={handleVisitorSelect}
            onCreateNew={() => setIsVisitorModalOpen(true)}
            selectedVisitors={selectedVisitors}
          />
          
          {selectedVisitors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>{visitor.name} {visitor.lastName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVisitor(visitor.id)}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persona a visitar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('namePersonToVisit', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.namePersonToVisit && (
              <p className="mt-1 text-sm text-red-600">{errors.namePersonToVisit.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('department', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edificio
            </label>
            <input
              type="number"
              {...register('building', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piso
            </label>
            <input
              type="number"
              {...register('floor', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo de la visita
          </label>
          <textarea
            {...register('reason')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa de vehículo
            </label>
            <input
              type="text"
              {...register('vehiclePlate')}
              placeholder="ABC-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de la persona a visitar
            </label>
            <input
              type="email"
              {...register('personToVisitEmail')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de carnet asignado
          </label>
          <input
            type="number"
            {...register('assignedCarnet', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('missionCase')}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Caso misional</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('sendEmail')}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Enviar email de notificación</span>
          </label>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Registrar Visita
          </button>
        </div>
      </form>

      <VisitorFormModal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        onSubmit={handleCreateVisitor}
      />
    </>
  );
};

export default VisitForm;
