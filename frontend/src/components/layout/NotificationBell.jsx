import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useEliminarNotificacion,
  useMarcarNotificacion,
  useMarcarTodasNotificaciones,
  useNotificaciones,
} from '../../hooks/useNotificaciones.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Loading from '../common/Loading.jsx';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotificaciones({ leida: false, limit: 5 });
  const marcarNotificacion = useMarcarNotificacion();
  const marcarTodas = useMarcarTodasNotificaciones();
  const eliminar = useEliminarNotificacion();

  const unreadCount = useMemo(
    () => data?.data?.items?.filter((item) => !item.leida).length ?? 0,
    [data]
  );

  const handleNotificationClick = async (notification) => {
    if (!notification.leida) {
      await marcarNotificacion.mutateAsync(notification.id);
    }
    if (notification.url) {
      window.location.href = notification.url;
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-white hover:bg-red-800"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-red-600">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-3 w-80 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notificaciones</p>
            <button
              type="button"
              className="text-xs text-red-600 hover:text-red-700"
              onClick={() => marcarTodas.mutateAsync()}
              disabled={marcarTodas.isPending}
            >
              {marcarTodas.isPending ? 'Marcando...' : 'Marcar todas'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <Loading className="py-8" message="Cargando notificaciones" />
            ) : data?.data?.items?.length ? (
              data.data.items.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-red-50 ${
                    notification.leida ? 'bg-white' : 'bg-red-50'
                  }`}
                >
                  <Badge variant={notification.leida ? 'neutral' : 'info'} className="mt-1">
                    {notification.tipo}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{notification.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">{notification.mensaje}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
                      {new Intl.DateTimeFormat('es-AR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(notification.creadoEn))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      eliminar.mutate(notification.id);
                    }}
                    className="rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                  >
                    {eliminar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                  </button>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No tenés notificaciones pendientes
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <Link to="/notificaciones" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center border-slate-200 text-slate-600"
              >
                Ver todas
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
