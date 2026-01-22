import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  return format(new Date(date), formatStr, { locale: es });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm', { locale: es });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  // Formato: (809) 123-4567
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
