import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { userApi } from '../api/userApi';
import type { User } from '../types/user.types';
import { UserPlus, Pencil, Trash2, Shield } from 'lucide-react';
import UserFormModal from '../components/users/UserFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userApi.delete(userToDelete.id);
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    } finally {
      setUserToDelete(null);
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Usuarios
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Gestión de usuarios del sistema
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 transition"
        >
          <UserPlus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Users Table */}
      <div className={`rounded-3xl border overflow-hidden ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Nombre
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Roles
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Último acceso
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-t transition ${
                    theme === 'dark'
                      ? 'border-slate-700 hover:bg-slate-700/30'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark'
                              ? 'bg-slate-700 text-gray-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className={`p-2 rounded-lg transition ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-6 py-12 text-center text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        user={selectedUser}
      />

      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Eliminar Usuario"
        message={`¿Está seguro de eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};

export default Users;
