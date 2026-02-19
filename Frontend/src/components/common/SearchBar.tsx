import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Buscar...', 
  onSearch, 
  debounceMs = 300 
}) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`} strokeWidth={2} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none transition text-sm ${
          theme === 'dark'
            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300'
        }`}
      />
      {query && (
        <button
          onClick={handleClear}
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${
            theme === 'dark'
              ? 'text-gray-500 hover:text-gray-300'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
