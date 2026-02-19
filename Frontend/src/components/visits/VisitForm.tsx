import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const [selectedVisitors, setSelectedVisitors] = useState<Visitor[]>([]);

  const inputClass = `w-full px-4 py-2.5 border rounded-full focus:outline-none transition ${
    theme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-white focus:border-slate-500'
      : 'bg-white border-gray-200 text-gray-900 focus:border-gray-300'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;
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
          <label className={labelClass}>
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
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                  theme === 'dark' ? 'bg-slate-700 text-gray-300 border-slate-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
                >
                  <span>{visitor.name} {visitor.lastName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVisitor(visitor.id)}
                    className="text-gray-500 hover:text-gray-700 transition"
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
            <label className={labelClass}>Persona a visitar <span className="text-red-500">*</span></label>
            <input type="text" {...register('namePersonToVisit', { required: 'Este campo es requerido' })} className={inputClass} />
            {errors.namePersonToVisit && <p className="mt-1 text-sm text-red-600">{errors.namePersonToVisit.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Departamento <span className="text-red-500">*</span></label>
            <input type="text" {...register('department', { required: 'Este campo es requerido' })} className={inputClass} />
            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Edificio</label>
            <input type="number" {...register('building', { valueAsNumber: true })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Piso</label>
            <input type="number" {...register('floor', { valueAsNumber: true })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Motivo de la visita</label>
          <textarea
            {...register('reason')}
            rows={3}
            className={`w-full px-4 py-2.5 border rounded-3xl focus:outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white focus:border-slate-500'
                : 'bg-white border-gray-200 text-gray-900 focus:border-gray-300'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Placa de vehículo</label>
            <input type="text" {...register('vehiclePlate')} placeholder="ABC-1234" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email de la persona a visitar</label>
            <input type="email" {...register('personToVisitEmail')} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Número de carnet asignado</label>
          <input type="number" {...register('assignedCarnet', { valueAsNumber: true })} className={inputClass} />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('missionCase')} className="rounded border-gray-200 text-gray-600 focus:ring-gray-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Caso misional</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('sendEmail')} className="rounded border-gray-200 text-gray-600 focus:ring-gray-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Enviar email de notificación</span>
          </label>
        </div>

        <div className={`flex gap-2 justify-end pt-4 border-t ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-full transition disabled:opacity-50 ${
              theme === 'dark' ? 'text-gray-300 bg-slate-700 hover:bg-slate-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-gray-600 to-gray-800 text-white rounded-full hover:from-gray-700 hover:to-gray-900 transition disabled:opacity-50"
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
