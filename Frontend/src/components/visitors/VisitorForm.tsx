import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Visitor, CreateVisitorRequest } from '../../types/visitor.types';
import { DocumentType } from '../../types/visitor.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

interface VisitorFormProps {
  visitor?: Visitor | null;
  onSubmit: (data: CreateVisitorRequest) => Promise<void>;
  onCancel: () => void;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ visitor, onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = `w-full px-4 py-2.5 border rounded-full focus:outline-none transition ${
    theme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-white focus:border-slate-500'
      : 'bg-white border-gray-200 text-gray-900 focus:border-gray-300'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateVisitorRequest>({
    defaultValues: visitor ? {
      name: visitor.name,
      lastName: visitor.lastName,
      documentType: visitor.documentType,
      identityDocument: visitor.identityDocument || '',
      email: visitor.email || '',
      phone: visitor.phone || '',
      institution: visitor.institution || '',
    } : {
      documentType: DocumentType.Cedula,
    },
  });

  useEffect(() => {
    if (visitor) {
      reset({
        name: visitor.name,
        lastName: visitor.lastName,
        documentType: visitor.documentType,
        identityDocument: visitor.identityDocument || '',
        email: visitor.email || '',
        phone: visitor.phone || '',
        institution: visitor.institution || '',
      });
    }
  }, [visitor, reset]);

  const onFormSubmit = async (data: CreateVisitorRequest) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
          <input type="text" {...register('name', { required: 'El nombre es requerido' })} className={inputClass} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Apellido <span className="text-red-500">*</span></label>
          <input type="text" {...register('lastName', { required: 'El apellido es requerido' })} className={inputClass} />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tipo de documento <span className="text-red-500">*</span></label>
          <select {...register('documentType', { required: 'El tipo de documento es requerido' })} className={inputClass}>
            <option value={DocumentType.Cedula}>Cédula</option>
            <option value={DocumentType.Pasaporte}>Pasaporte</option>
            <option value={DocumentType.SinIdentificacion}>Sin identificación</option>
          </select>
          {errors.documentType && <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Número de documento</label>
          <input type="text" {...register('identityDocument')} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })} className={inputClass} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input type="text" {...register('phone', { pattern: { value: /^\d{3}-\d{3}-\d{4}$/, message: 'Formato: 000-000-0000' } })} placeholder="000-000-0000" className={inputClass} />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Institución / Empresa</label>
        <input type="text" {...register('institution')} className={inputClass} />
      </div>

      <div className="flex gap-2 justify-end pt-4">
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
          {visitor ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default VisitorForm;
