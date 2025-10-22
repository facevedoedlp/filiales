import { useQuery } from '@tanstack/react-query';
import * as dashboardAPI from '../api/dashboard';

export const useDashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardAPI.getDashboardData,
  });

  return {
    data: dashboardQuery.data,
    stats: dashboardQuery.data?.general || {},
    resumen: dashboardQuery.data?.resumen || {},
    accionesStats: dashboardQuery.data?.acciones || {},
    entradasStats: dashboardQuery.data?.entradas || {},
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
};
