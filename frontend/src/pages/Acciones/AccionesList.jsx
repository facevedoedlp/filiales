import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import { useAcciones } from '../../hooks/useAcciones';
import { useAuth } from '../../hooks/useAuth';
import { useFiliales } from '../../hooks/useFiliales';
import { ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const estadoOptions = [
  { value: '', label: 'Todas' },
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'FINALIZADA', label: 'Finalizada' },
];

const AccionesList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const pageSize = 9;

  const listFilters = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...filters,
    }),
    [page, filters, pageSize]
  );

  const { data, isLoading, isError, error, acciones, pagination, deleteAccion } = useAcciones(listFilters);
  const { filiales } = useFiliales(useMemo(() => ({ page_size: 200 }), []));

  const accionesList = data?.resultados || data?.results || acciones || [];
  const total = pagination.count ?? accionesList.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filialesOptions = filiales.map((filial) => ({ value: filial.id, label: filial.nombre }));

  const handleDelete = async (accionId) => {
    const confirmed = window.confirm('¿Deseas eliminar esta acción?');
    if (!confirmed) return;
    await deleteAccion(accionId);
  };

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
        title="No pudimos cargar las acciones"
        description={error?.message || 'Revisa tu conexión e intenta nuevamente.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Acciones solidarias</h1>
          <p className="text-sm text-slate-500">Registro de actividades realizadas por cada filial.</p>
        </div>
        {user?.rol !== ROLES.INTEGRANTE && (
          <Button onClick={() => navigate('/acciones/nueva')}>Nueva acción</Button>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="Nombre de la acción"
          value={filters.search || ''}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, search: event.target.value || undefined }));
            setPage(1);
          }}
        />
        <Select
          label="Filial"
          value={filters.filial || ''}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, filial: event.target.value || undefined }));
            setPage(1);
          }}
          options={[{ value: '', label: 'Todas' }, ...filialesOptions]}
        />
        <Select
          label="Estado"
          value={filters.estado || ''}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, estado: event.target.value || undefined }));
            setPage(1);
          }}
          options={estadoOptions}
        />
        <Input
          label="Desde"
          type="date"
          value={filters.desde || ''}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, desde: event.target.value || undefined }));
            setPage(1);
          }}
        />
      </div>

      {accionesList.length === 0 ? (
        <EmptyState
          title="No hay acciones registradas"
          description="Cuando se publiquen nuevas acciones podrás verlas aquí."
          action={
            user?.rol !== ROLES.INTEGRANTE ? (
              <Button onClick={() => navigate('/acciones/nueva')}>Registrar acción</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accionesList.map((accion) => (
            <Card key={accion.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{accion.titulo || accion.nombre}</h2>
                    <p className="text-sm text-slate-500">{accion.descripcion?.slice(0, 120)}...</p>
                  </div>
                  <Badge variant={accion.estado === 'FINALIZADA' ? 'success' : 'info'}>
                    {accion.estado || 'Programada'}
                  </Badge>
                </div>

                <div className="space-y-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {(accion.fecha || accion.fecha_inicio) && (
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#c41230]" />
                      {formatDate(accion.fecha || accion.fecha_inicio)}
                    </p>
                  )}
                  {accion.ubicacion && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#c41230]" />
                      {accion.ubicacion}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#c41230]" />
                    Participantes: {accion.participantes || accion.total_participantes || 0}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/acciones/${accion.id}`)}>
                    Ver detalle
                  </Button>
                  {user?.rol !== ROLES.INTEGRANTE && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(accion.id)}>
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {accionesList.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span>
            Página {page} de {totalPages} · {total} acciones
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccionesList;
