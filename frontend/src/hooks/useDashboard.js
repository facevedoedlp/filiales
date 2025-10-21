import { useQuery } from '@tanstack/react-query';
import * as dashboardAPI from '../api/dashboard';

export const useDashboard = (options = {}) => {
  const generalQuery = useQuery({
    queryKey: ['dashboard', 'general'],
    queryFn: dashboardAPI.getGeneral,
    enabled: options.general !== false,
  });

  const accionesQuery = useQuery({
    queryKey: ['dashboard', 'acciones'],
    queryFn: dashboardAPI.getAccionesStats,
    enabled: options.acciones !== false,
  });

  const entradasQuery = useQuery({
    queryKey: ['dashboard', 'entradas'],
    queryFn: dashboardAPI.getEntradasStats,
    enabled: options.entradas !== false,
  });

  const resumenQuery = useQuery({
    queryKey: ['dashboard', 'resumen'],
    queryFn: dashboardAPI.getResumen,
    enabled: options.resumen !== false,
  });

  return {
    general: generalQuery.data,
    accionesStats: accionesQuery.data,
    entradasStats: entradasQuery.data,
    resumen: resumenQuery.data,
    isLoading:
      generalQuery.isLoading ||
      accionesQuery.isLoading ||
      entradasQuery.isLoading ||
      resumenQuery.isLoading,
  };
};

export const useDashboardFilial = (filialId) =>
  useQuery({
    queryKey: ['dashboard', 'filial', filialId],
    queryFn: () => dashboardAPI.getFilialStats(filialId),
    enabled: Boolean(filialId),
  });
