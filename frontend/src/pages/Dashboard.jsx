import { Building2, Ticket, Users, Activity, BarChart3, MessageSquare } from 'lucide-react';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { useDashboard } from '../hooks/useDashboard';

const formatLabel = (label) =>
  label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const renderValue = (value) => {
  if (value === null || value === undefined) {
    return 'Sin datos';
  }

  if (typeof value === 'number') {
    return value.toLocaleString('es-AR');
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'Sin registros';
    return (
      <ul className="space-y-1">
        {value.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#c41230]" />
            <span className="text-slate-600">{typeof item === 'object' ? JSON.stringify(item) : item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return 'Sin registros';
    return (
      <dl className="grid gap-2">
        {entries.map(([key, val]) => (
          <div key={key} className="grid gap-1">
            <dt className="text-xs font-semibold uppercase text-slate-500">{formatLabel(key)}</dt>
            <dd className="text-sm text-slate-700">{renderValue(val)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return String(value);
};

const Dashboard = () => {
  const { stats, resumen, accionesStats, entradasStats, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="No pudimos cargar el tablero"
        description={error?.message || 'Intenta nuevamente en unos minutos.'}
      />
    );
  }

  const statCards = [
    {
      title: 'Filiales',
      value: stats?.total_filiales ?? stats?.filiales ?? 0,
      icon: Building2,
    },
    {
      title: 'Integrantes',
      value: stats?.total_integrantes ?? stats?.integrantes ?? 0,
      icon: Users,
    },
    {
      title: 'Acciones',
      value: stats?.total_acciones ?? stats?.acciones ?? 0,
      icon: Activity,
    },
    {
      title: 'Solicitudes',
      value: stats?.total_entradas ?? stats?.entradas ?? 0,
      icon: Ticket,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Tablero general</h1>
        <p className="text-sm text-slate-500">
          Visualiza el pulso de las filiales, integrantes y acciones del club.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value?.toLocaleString?.('es-AR') ?? value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c41230]/10 text-[#c41230]">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Resumen general" description="Datos consolidados del último período reportado.">
        {Object.keys(resumen || {}).length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay un resumen disponible.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(resumen).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">{formatLabel(key)}</p>
                <div className="mt-1 text-sm text-slate-700">{renderValue(value)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Acciones solidarias" description="Últimas estadísticas de participación">
          {Object.keys(accionesStats || {}).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
              <BarChart3 className="h-10 w-10 text-[#c41230]/70" />
              <span className="text-sm">Aún no hay datos registrados de acciones.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(accionesStats).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-slate-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{formatLabel(key)}</p>
                  <div className="mt-1 text-sm text-slate-700">{renderValue(value)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Solicitudes de entradas" description="Trámite y estado de pedidos">
          {Object.keys(entradasStats || {}).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
              <MessageSquare className="h-10 w-10 text-[#c41230]/70" />
              <span className="text-sm">No se registran solicitudes recientes.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(entradasStats).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-slate-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{formatLabel(key)}</p>
                  <div className="mt-1 text-sm text-slate-700">{renderValue(value)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
