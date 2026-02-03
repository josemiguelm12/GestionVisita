import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      logout();
      toast.success('Sesión cerrada');
    }
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-white">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-indigo-600" />
        <span className="font-semibold text-gray-900">Gestión de Visitas</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User2 className="h-5 w-5 text-gray-500" />
          <span>{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;
