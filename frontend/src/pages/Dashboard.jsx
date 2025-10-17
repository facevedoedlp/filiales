import { Link } from 'react-router-dom';
import { CalendarClock, Flag, MessageSquare, Ticket, Users } from 'lucide-react';
import { useFiliales } from '../hooks/useFiliales.js';
import { useIntegrantes } from '../hooks/useIntegrantes.js';
import { useAcciones } from '../hooks/useAcciones.js';
import { usePedidosEntradas, useFixture } from '../hooks/useEntradas.js';
import { useTemas } from '../hooks/useForo.js';
import { useNotificaciones } from '../hooks/useNotificaciones.js';
import Loading from '../components/common/Loading.jsx';
import Badge from '../components/common/Badge.jsx';

const Dashboard = () => {
  const { data: filialesData, isLoading: loadingFiliales } = useFiliales({ page: 1, limit: 5, esActiva: true });
  const { data: integrantesData, isLoading: loadingIntegrantes } = useIntegrantes({ page: 1, limit: 5 });
  const { data: accionesData, isLoading: loadingAcciones } = useAcciones({ page: 1, limit: 5 });
  const { data: pedidosData } = usePedidosEntradas({ page: 1, limit: 5, aprobacionSocios: 'PENDIENTE' });
  const { data: fixtureData } = useFixture({ proximos: true, limit: 5 });
  const { data: temasData } = useTemas({ page: 1, limit: 5, orden: 'recientes' });
  const { data: notificacionesData } = useNotificaciones({ leida: false });

  const filialesTotal = filialesData?.data?.pagination?.total ?? 0;
  const integrantesTotal = integrantesData?.data?.pagination?.total ?? 0;
  const accionesMes = (accionesData?.data?.items || []).filter((accion) => {
    const fecha = new Date(accion.fecha);
    const hoy = new Date();
    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  }).length;
  const pedidosPendientes = pedidosData?.data?.pagination?.total ?? 0;

  const isLoading = loadingFiliales || loadingIntegrantes || loadingAcciones;

  if (isLoading) {
    return <Loading message="Preparando tu tablero" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Resumen general de la actividad de las filiales, pedidos y novedades.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          icon={Users}
          title="Filiales activas"
          value={filialesTotal.toLocaleString('es-AR')}
          subtitle="Filiales en funcionamiento"
        />
        <SummaryCard
          icon={Flag}
          title="Integrantes activos"
          value={integrantesTotal.toLocaleString('es-AR')}
          subtitle="Total de integrantes registrados"
        />
        <SummaryCard
          icon={MessageSquare}
          title="Acciones este mes"
          value={accionesMes.toLocaleString('es-AR')}
          subtitle="Acciones registradas"
        />
        <SummaryCard
          icon={Ticket}
          title="Pedidos pendientes"
          value={pedidosPendientes.toLocaleString('es-AR')}
          subtitle="Entradas por aprobar"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Últimas acciones" linkLabel="Ver todas" linkTo="/acciones">
          {accionesData?.data?.items?.length ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {accionesData.data.items.slice(0, 5).map((accion) => (
                <li key={accion.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{accion.titulo}</p>
                    <p className="text-xs text-slate-500">
                      {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(accion.fecha))} ·{' '}
                      {accion.filialNombre}
                    </p>
                  </div>
                  <Badge variant="info">{accion.tipo}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyContent message="Todavía no se registraron acciones." />
          )}
        </Card>

        <Card title="Últimos temas del foro" linkLabel="Ir al foro" linkTo="/foro">
          {temasData?.data?.items?.length ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {temasData.data.items.slice(0, 5).map((tema) => (
                <li key={tema.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{tema.titulo}</p>
                    <p className="text-xs text-slate-500">{tema.autorNombre}</p>
                  </div>
                  <Badge variant="neutral">{tema.totalRespuestas} respuestas</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyContent message="Aún no hay conversaciones." />
          )}
        </Card>

        <Card title="Notificaciones recientes" linkLabel="Ver todas" linkTo="/notificaciones">
          {notificacionesData?.data?.items?.length ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {notificacionesData.data.items.slice(0, 5).map((notificacion) => (
                <li key={notificacion.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="font-semibold text-slate-800">{notificacion.titulo}</p>
                  <p className="text-xs text-slate-500">{notificacion.mensaje}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyContent message="No hay notificaciones nuevas." />
          )}
        </Card>

        <Card title="Próximos partidos" linkLabel="Ver solicitudes" linkTo="/entradas">
          {fixtureData?.data?.items?.length ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {fixtureData.data.items.map((fixture) => (
                <li key={fixture.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{fixture.rival}</p>
                    <p className="text-xs text-slate-500">
                      {new Intl.DateTimeFormat('es-AR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(fixture.fecha))}
                    </p>
                  </div>
                  <CalendarClock className="h-5 w-5 text-red-600" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyContent message="No hay partidos próximos." />
          )}
        </Card>
      </section>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-red-100 p-3 text-red-600">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  </div>
);

const Card = ({ title, children, linkLabel, linkTo }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <Link to={linkTo} className="text-sm font-medium text-red-600 hover:underline">
        {linkLabel}
      </Link>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const EmptyContent = ({ message }) => (
  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{message}</p>
);

export default Dashboard;
