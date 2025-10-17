import { useParams } from 'react-router-dom';
import { CalendarClock, Phone, ShieldCheck, UserCircle } from 'lucide-react';
import { useIntegrante } from '../../hooks/useIntegrantes.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Badge from '../../components/common/Badge.jsx';

const IntegranteDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useIntegrante(id);
  const integrante = data?.data;

  if (isLoading) {
    return <Loading message="Cargando integrante" />;
  }

  if (!integrante) {
    return (
      <EmptyState
        title="No encontramos el integrante"
        description="Revisá que el enlace sea correcto o que tengas permisos."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{integrante.nombre}</h1>
            <p className="text-sm text-slate-500">DNI {integrante.dni || '—'}</p>
          </div>
          <Badge variant={integrante.es_activo ? 'success' : 'danger'}>
            {integrante.es_activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <UserCircle className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cargo</p>
              <p className="text-sm font-semibold text-slate-800">{integrante.cargo || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Referente</p>
              <p className="text-sm font-semibold text-slate-800">
                {integrante.es_referente ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Contacto</p>
              <p className="text-sm font-semibold text-slate-800">
                {integrante.telefono || integrante.correo || integrante.email || 'Sin datos'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarClock className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Alta</p>
              <p className="text-sm font-semibold text-slate-800">
                {integrante.fecha_ingreso
                  ? new Intl.DateTimeFormat('es-AR', {
                      dateStyle: 'medium',
                    }).format(new Date(integrante.fecha_ingreso))
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {integrante.historial_inactividad?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Historial</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {integrante.historial_inactividad.map((evento) => (
              <li key={evento.id} className="rounded-lg border border-slate-100 p-3">
                <p className="font-medium text-slate-800">{evento.motivo || 'Cambio de estado'}</p>
                <p className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat('es-AR', {
                    dateStyle: 'medium',
                  }).format(new Date(evento.fecha_inicio))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default IntegranteDetail;
