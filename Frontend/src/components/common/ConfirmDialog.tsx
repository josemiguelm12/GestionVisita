import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'warning',
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-gradient-to-b from-red-600 to-red-800 hover:from-red-700 hover:to-red-900',
    warning: 'bg-gradient-to-b from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900',
    info: 'bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`rounded-3xl shadow-xl max-w-md w-full mx-4 border ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{title}</h3>
          </div>
          <button onClick={onCancel} className={theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{message}</p>
        </div>
        <div className={`flex gap-2 justify-end p-4 border-t ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onCancel}
            className={`px-6 py-2.5 rounded-full transition ${
              theme === 'dark' ? 'text-gray-300 bg-slate-700 hover:bg-slate-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-full transition ${variantStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
