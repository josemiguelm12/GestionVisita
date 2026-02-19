import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { userApi } from '../../api/userApi';
import type { User, Role, CreateUserRequest, UpdateUserRequest } from '../../types/user.types';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const inputClass = `w-full px-4 py-2.5 border rounded-full focus:outline-none transition ${
    theme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500'
      : 'bg-white border-gray-200 text-gray-900 focus:border-gray-300'
  }`;
  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        }
      : {
          name: '',
          email: '',
          password: '',
          isActive: true,
        },
  });

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      if (user) {
        setSelectedRoles(user.roles.map((r) => r.id));
      } else {
        setSelectedRoles([]);
      }
    }
  }, [isOpen, user]);

  const loadRoles = async () => {
    try {
      const data = await userApi.getRoles();
      setRoles(data);
    } catch (error) {
      toast.error('Error al cargar roles');
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const onSubmit = async (data: any) => {
    if (selectedRoles.length === 0) {
      toast.error('Debe seleccionar al menos un rol');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // Actualizar
        const updateData: UpdateUserRequest = {
          name: data.name,
          email: data.email,
          roleIds: selectedRoles,
          isActive: data.isActive,
          password: data.password || undefined,
        };
        await userApi.update(user.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear
        if (!data.password) {
          toast.error('La contraseña es requerida');
          return;
        }
        const createData: CreateUserRequest = {
          name: data.name,
          email: data.email,
          password: data.password,
          roleIds: selectedRoles,
        };
        await userApi.create(createData);
        toast.success('Usuario creado exitosamente');
      }
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuario' : 'Nuevo Usuario'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className={labelClass}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'El nombre es requerido' })}
            className={inputClass}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'El email es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className={labelClass}>
            Contraseña {!user && <span className="text-red-500">*</span>}
            {user && <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>(dejar en blanco para no cambiar)</span>}
          </label>
          <input
            type="password"
            {...register('password', {
              required: !user ? 'La contraseña es requerida' : false,
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
            })}
            className={inputClass}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {/* Roles */}
        <div>
          <label className={`${labelClass} mb-2`}>
            Roles <span className="text-red-500">*</span>
          </label>
          <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-xl p-3 ${
            theme === 'dark' ? 'border-slate-600 bg-slate-700/50' : 'border-gray-200'
          }`}>
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className={`rounded focus:ring-gray-500 ${
                    theme === 'dark' ? 'border-slate-500 bg-slate-600 text-gray-400' : 'border-gray-200 text-gray-600'
                  }`}
                />
                <div>
                  <span className={`text-sm font-medium ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{role.name}</span>
                  {role.description && (
                    <span className={`text-xs block ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{role.description}</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {user && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className={`rounded focus:ring-gray-500 ${
                  theme === 'dark' ? 'border-slate-500 bg-slate-600 text-gray-400' : 'border-gray-200 text-gray-600'
                }`}
              />
              <span className={`text-sm ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Usuario activo</span>
            </label>
          </div>
        )}

        {/* Buttons */}
        <div className={`flex gap-2 justify-end pt-4 border-t ${ theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`px-6 py-2.5 rounded-full transition disabled:opacity-50 ${
              theme === 'dark' ? 'text-gray-300 bg-slate-700 hover:bg-slate-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-gray-600 to-gray-800 text-white rounded-full hover:from-gray-700 hover:to-gray-900 transition disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            {user ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
