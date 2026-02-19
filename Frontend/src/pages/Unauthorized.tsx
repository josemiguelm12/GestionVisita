import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`min-h-[60vh] flex items-center justify-center`}>
      <div className="text-center max-w-md px-6">
        <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-6 ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-red-50'
        }`}>
          <ShieldOff className={`h-10 w-10 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Acceso denegado
        </h1>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No tienes permisos para acceder a esta sección. Contacta al administrador si crees que es un error.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-gray-600 to-gray-800 text-white rounded-full hover:from-gray-700 hover:to-gray-900 transition"
        >
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
