import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), pattern, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha', error);
    return '';
  }
};

export const formatDateTime = (date) => formatDate(date, "dd/MM/yyyy HH:mm'h'");

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Number(value || 0));

export const formatEstado = (estado) => {
  if (!estado) return 'Desconocido';
  const map = {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo',
  };
  return map[estado] || estado;
};
