import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  useEliminarNotificacion,
  useMarcarNotificacion,
  useMarcarTodasNotificaciones,
  useNotificaciones,
} from '../../hooks/useNotificaciones.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const NotificacionList = () => {
  const [filters, setFilters] = useState({ leida: null });
  const queryFilters = { ...filters };
  Object.keys(queryFilters).forEach((key) => {
    if (queryFilters[key] === null) {
      delete queryFilters[key];
    }
  });
  const { data, isLoading } = useNotificaciones(queryFilters);
  const marcar = useMarcarNotificacion();
  const marcarTodas = useMarcarTodasNotificaciones();
  const eliminar = useEliminarNotificacion();

  const notificaciones = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notificaciones</h1>
          <p className="text-sm text-slate-500">
            Revisá las últimas novedades y marcá como leídas para mantenerte al día.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilters({ leida: null })}>
            Todas
          </Button>
          <Button variant="outline" onClick={() => setFilters({ leida: false })}>
            No leídas
          </Button>
          <Button variant="outline" onClick={() => setFilters({ leida: true })}>
            Leídas
          </Button>
          <Button onClick={() => marcarTodas.mutate()} disabled={marcarTodas.isPending}>
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loading message="Cargando notificaciones" />
      ) : notificaciones.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          description="No encontramos notificaciones con los filtros seleccionados."
        />
      ) : (
        <div className="space-y-3">
          {notificaciones.map((notificacion) => (
            <article
              key={notificacion.id}
              className={`rounded-2xl border border-slate-200 bg-white p-5 transition ${
                notificacion.leida ? 'opacity-70' : 'hover:border-red-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{notificacion.titulo}</h2>
                  <p className="mt-1 text-sm text-slate-600">{notificacion.mensaje}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
                      new Date(notificacion.creadoEn)
                    )}
                  </p>
                </div>
                <Badge variant={notificacion.leida ? 'neutral' : 'info'}>
                  {notificacion.leida ? 'Leída' : 'Nueva'}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!notificacion.leida ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => marcar.mutate(notificacion.id)}
                    disabled={marcar.isPending}
                  >
                    Marcar como leída
                  </Button>
                ) : null}
                {notificacion.url ? (
                  <Button size="sm" variant="outline" onClick={() => (window.location.href = notificacion.url)}>
                    Abrir
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => eliminar.mutate(notificacion.id)}>
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificacionList;
