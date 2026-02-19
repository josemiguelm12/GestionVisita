import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User2, Sun, Moon, Package } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      logout();
      toast.success('Sesión cerrada');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-20 flex items-center justify-between h-14 px-4 border-b ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
            <Package className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Gestión Visitas
            </span>
          </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className={`flex items-center gap-2 text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <User2 className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <span>{user?.name}</span>
        </div>

        <button
          onClick={handleLogout}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;
