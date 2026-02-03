import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Visitor, CreateVisitorRequest } from '../../types/visitor.types';
import { DocumentType } from '../../types/visitor.types';
import LoadingSpinner from '../common/LoadingSpinner';

interface VisitorFormProps {
  visitor?: Visitor | null;
  onSubmit: (data: CreateVisitorRequest) => Promise<void>;
  onCancel: () => void;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ visitor, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'El nombre es requerido' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('lastName', { required: 'El apellido es requerido' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de documento <span className="text-red-500">*</span>
          </label>
          <select
            {...register('documentType', { required: 'El tipo de documento es requerido' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={DocumentType.Cedula}>Cédula</option>
            <option value={DocumentType.Pasaporte}>Pasaporte</option>
            <option value={DocumentType.SinIdentificacion}>Sin identificación</option>
          </select>
          {errors.documentType && (
            <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de documento
          </label>
          <input
            type="text"
            {...register('identityDocument')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            {...register('phone', {
              pattern: {
                value: /^\d{3}-\d{3}-\d{4}$/,
                message: 'Formato: 000-000-0000',
              },
            })}
            placeholder="000-000-0000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Institución / Empresa
        </label>
        <input
          type="text"
          {...register('institution')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
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
          {visitor ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default VisitorForm;
