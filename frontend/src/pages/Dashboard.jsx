import { Users, Building2, Activity, Ticket } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard, useDashboardFilial } from '../hooks/useDashboard';
import StatsCard from '../components/dashboard/StatsCard';
import ChartAcciones from '../components/dashboard/ChartAcciones';
import ChartEntradas from '../components/dashboard/ChartEntradas';
import ResumenGeneral from '../components/dashboard/ResumenGeneral';
import Spinner from '../components/common/Spinner';
import { ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const { general, accionesStats, entradasStats, resumen, isLoading } = useDashboard();
  const filialQuery = useDashboardFilial(user?.filial_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Filiales activas',
      value: general?.filiales_activas,
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      title: 'Integrantes',
      value: general?.integrantes,
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: 'Acciones en curso',
      value: general?.acciones_en_curso,
      icon: <Activity className="h-6 w-6" />,
    },
    {
      title: 'Entradas pendientes',
      value: general?.entradas_pendientes,
      icon: <Ticket className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </div>

      {user?.rol === ROLES.PRESIDENTE && filialQuery.data && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Mi filial</h3>
          <p className="mt-2 text-sm text-slate-600">
            Integrantes: {filialQuery.data.integrantes} · Acciones: {filialQuery.data.acciones}
          </p>
        </div>
      )}

      {user?.rol === ROLES.INTEGRANTE && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Mi actividad</h3>
          <p className="mt-2 text-sm text-slate-600">
            Acciones realizadas: {general?.mis_acciones} · Participaciones en foro: {general?.mis_respuestas}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartAcciones data={accionesStats?.detalle || []} />
        <ChartEntradas data={entradasStats?.detalle || []} />
      </div>

      <ResumenGeneral resumen={resumen} />
    </div>
  );
};

export default Dashboard;
