import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const { theme } = useTheme();

  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const btnBase = `h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition`;
  const btnInactive = theme === 'dark'
    ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900';
  const btnActive = theme === 'dark'
    ? 'bg-slate-600 text-white'
    : 'bg-gray-800 text-white';
  const btnDisabled = 'opacity-30 cursor-not-allowed';

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${
      theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'
    }`}>
      <span className="text-sm">
        Mostrando {from}–{to} de {totalItems} registros
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="h-9 w-9 flex items-center justify-center text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`${btnBase} ${page === currentPage ? btnActive : btnInactive}`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
