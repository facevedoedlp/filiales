import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, FileText, MapPin, Phone, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useFilial, useFilialEstadisticas } from '../../hooks/useFiliales.js';
import { useIntegrantes } from '../../hooks/useIntegrantes.js';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const TABS = ['info', 'integrantes', 'acciones', 'estadisticas'];

const FilialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const { data, isLoading } = useFilial(id);
  const { data: estadisticasData } = useFilialEstadisticas(id);
  const {
    data: integrantesData,
    isLoading: loadingIntegrantes,
  } = useIntegrantes({ filialId: id, page: 1, limit: 20, esActivo: true });

  const filial = data?.data;

  const integrantes = integrantesData?.data?.items ?? filial?.integrantes ?? [];
  const acciones = filial?.acciones?.items ?? [];

  const integrantColumns = useMemo(
    () => [
      {
        header: 'Nombre',
        accessor: 'nombre',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-800">{row.nombre}</p>
            <p className="text-xs text-slate-500">{row.cargo}</p>
          </div>
        ),
      },
      {
        header: 'Contacto',
        accessor: 'correo',
        render: (row) => (
          <div className="text-xs text-slate-600">
            {row.correo ? <p>{row.correo}</p> : null}
            {row.telefono ? <p>{row.telefono}</p> : null}
          </div>
        ),
      },
      {
        header: 'Estado',
        accessor: 'esActivo',
        render: (row) => (
          <Badge variant={row.esActivo ? 'success' : 'danger'}>
            {row.esActivo ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
    ],
    []
  );

  const accionesColumns = useMemo(
    () => [
      {
        header: 'Actividad',
        accessor: 'titulo',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-800">{row.titulo}</p>
            <p className="text-xs text-slate-500">{row.tipo}</p>
          </div>
        ),
      },
      {
        header: 'Fecha',
        accessor: 'fecha',
        render: (row) =>
          new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'medium',
          }).format(new Date(row.fecha)),
      },
      {
        header: 'Participantes',
        accessor: 'participantes',
      },
    ],
    []
  );

  if (isLoading) {
    return <Loading message="Cargando información de la filial" />;
  }

  if (!filial) {
    return (
      <EmptyState
        title="No encontramos la filial"
        description="Es posible que haya sido eliminada o que no tengas permisos para verla."
        actionLabel="Volver"
        onAction={() => navigate('/filiales')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{filial.nombre}</h1>
          <p className="text-sm text-slate-500">
            Última actualización:{' '}
            {filial.actualizadaEn
              ? new Intl.DateTimeFormat('es-AR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(filial.actualizadaEn))
              : '—'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(user?.rol === 'ADMIN' || user?.rol === 'COORDINADOR') && (
            <Link to={`/filiales/${id}/editar`}>
              <Button variant="outline">Editar</Button>
            </Link>
          )}
          {(user?.rol === 'ADMIN' || user?.rol === 'COORDINADOR') && (
            <Link to={`/filiales/${id}/renovar`}>
              <Button>Renovar autoridades</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-10 w-10 rounded-full bg-red-50 p-2 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Ubicación</p>
              <p className="text-sm font-semibold text-slate-800">
                {filial.localidadNombre} ({filial.provinciaNombre})
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Users className="h-10 w-10 rounded-full bg-red-50 p-2 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Integrantes activos</p>
              <p className="text-sm font-semibold text-slate-800">{filial.totalIntegrantesActivos ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-10 w-10 rounded-full bg-red-50 p-2 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Fundada</p>
              <p className="text-sm font-semibold text-slate-800">
                {filial.fechaFundacion
                  ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
                      new Date(filial.fechaFundacion)
                    )
                  : '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Phone className="h-10 w-10 rounded-full bg-red-50 p-2 text-red-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Contacto</p>
              <p className="text-sm font-semibold text-slate-800">{filial.telefono || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full bg-white p-1 shadow">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-500 hover:bg-red-50'
            }`}
          >
            {tab === 'info' && 'Info General'}
            {tab === 'integrantes' && 'Integrantes'}
            {tab === 'acciones' && 'Acciones'}
            {tab === 'estadisticas' && 'Estadísticas'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {activeTab === 'info' ? (
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Datos principales</h3>
              <dl className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Nombre</dt>
                  <dd className="font-medium text-slate-800">{filial.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Mail institucional</dt>
                  <dd className="font-medium text-slate-800">{filial.mailInstitucional || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Dirección</dt>
                  <dd className="font-medium text-slate-800">{filial.direccion || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Autoridades</dt>
                  <dd className="font-medium text-slate-800">{filial.autoridades || '—'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Documentación</h3>
              {filial.documentos?.length ? (
                <ul className="mt-2 space-y-2 text-sm">
                  {filial.documentos.map((documento) => (
                    <li key={documento.id} className="flex items-center gap-2 text-red-600">
                      <FileText className="h-4 w-4" />
                      <a
                        href={documento.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {documento.nombre}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No se cargaron documentos.</p>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === 'integrantes' ? (
          <Table
            columns={integrantColumns}
            data={integrantes}
            loading={loadingIntegrantes}
            emptyMessage="No hay integrantes activos registrados"
          />
        ) : null}

        {activeTab === 'acciones' ? (
          <Table
            columns={accionesColumns}
            data={acciones}
            loading={false}
            emptyMessage="Aún no se registraron acciones"
          />
        ) : null}

        {activeTab === 'estadisticas' ? (
          <div className="grid gap-4 md:grid-cols-2">
            {estadisticasData?.data ? (
              Object.entries(estadisticasData.data).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{key}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hay estadísticas para mostrar.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FilialDetail;
