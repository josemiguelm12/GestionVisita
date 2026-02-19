import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { visitorApi } from '../../api/visitorApi';
import type { Visitor } from '../../types/visitor.types';
import { useTheme } from '../../context/ThemeContext';

interface VisitorAutocompleteProps {
  onSelect: (visitor: Visitor) => void;
  onCreateNew: () => void;
  selectedVisitors?: Visitor[];
  placeholder?: string;
}

const VisitorAutocomplete: React.FC<VisitorAutocompleteProps> = ({
  onSelect,
  onCreateNew,
  selectedVisitors = [],
  placeholder = 'Buscar visitante por nombre o cédula...',
}) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Visitor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchVisitors = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await visitorApi.search(query);
        // Filtrar visitantes ya seleccionados
        const filtered = data.filter(
          (v) => !selectedVisitors.some((sv) => sv.id === v.id)
        );
        setResults(filtered);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching visitors:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchVisitors, 300);
    return () => clearTimeout(timer);
  }, [query, selectedVisitors]);

  const handleSelect = (visitor: Visitor) => {
    onSelect(visitor);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-2.5 border rounded-full focus:outline-none transition ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500'
              : 'bg-white border-gray-200 text-gray-900 focus:border-gray-300'
          }`}
        />
      </div>

      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 border rounded-3xl shadow-lg max-h-60 overflow-y-auto ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          {loading && (
            <div className={`px-4 py-3 text-sm ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Buscando...</div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3">
              <p className={`text-sm mb-2 ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No se encontraron visitantes</p>
              <button
                onClick={onCreateNew}
                className={`inline-flex items-center gap-2 text-sm transition ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                Crear nuevo visitante
              </button>
            </div>
          )}

          {!loading && results.map((visitor) => (
            <button
              key={visitor.id}
              onClick={() => handleSelect(visitor)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-b-0 ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 border-slate-700'
                  : 'hover:bg-gray-50 border-gray-100'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
              }`}>
                <User className={`h-5 w-5 ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {visitor.name} {visitor.lastName}
                </p>
                <p className={`text-xs ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {visitor.identityDocument || 'Sin documento'} • {visitor.institution || 'Sin institución'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorAutocomplete;
