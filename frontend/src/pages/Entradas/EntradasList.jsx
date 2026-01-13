import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Ticket } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import Table from '../../components/common/Table';
import { useEntradas } from '../../hooks/useEntradas';
import { useFiliales } from '../../hooks/useFiliales';
import { ESTADOS_ENTRADA } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const EntradasList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const pageSize = 10;

  const listFilters = useMemo(() => {
    const { desde, ...rest } = filters;
    return {
      page,
      page_size: pageSize,
      ...(desde ? { created_at__date__gte: desde } : {}),
      ...rest,
    };
  }, [page, pageSize, filters]);

  const { data, isLoading, isError, error, pagination } = useEntradas(listFilters);
  const { filiales } = useFiliales(useMemo(() => ({ page_size: 200 }), []));

  const entradas = data?.resultados || data?.results || [];
  const total = pagination.count ?? entradas.length;

  const filialesOptions = filiales.map((filial) => ({ value: filial.id, label: filial.nombre }));

  const columns = [
    {
      key: 'detalle',
      header: 'Solicitud',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">
            {row.partido_titulo || row.partido || `Solicitud #${row.id}`}
          </p>
          <p className="text-xs text-slate-500">Cantidad: {row.cantidad_solicitada || 0}</p>
        </div>
      ),
    },
    {
      key: 'filial',
      header: 'Filial',
      cell: (row) => row.filial_nombre || row.filial?.nombre || 'Sin asignar',
    },
    {
      key: 'solicitante',
      header: 'Integrante',
      cell: (row) => row.created_by_nombre || row.integrante?.nombre || 'Sin datos',
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge
          variant={
            row.estado === 'APROBADA'
              ? 'success'
              : row.estado === 'RECHAZADA'
              ? 'warning'
              : 'info'
          }
        >
          {row.estado === 'APROBADA' ? 'Aprobada' : row.estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (row) => formatDate(row.fecha || row.fecha_solicitud || row.created_at),
    },
  ];

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
        title="No pudimos cargar las solicitudes"
        description={error?.message || 'Revisa tu conexión e intenta nuevamente.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de entradas</h1>
        <p className="text-sm text-slate-500">Consulta el estado de las solicitudes realizadas por cada filial.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="Evento o integrante"
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
          options={[{ value: '', label: 'Todos' }, ...ESTADOS_ENTRADA]}
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

      {entradas.length === 0 ? (
        <EmptyState
          title="No hay solicitudes registradas"
          description="Prueba modificando los filtros o generando una nueva solicitud."
          action={
            <Button leftIcon={<Ticket className="h-4 w-4" />} onClick={() => navigate('/entradas/nueva')}>
              Crear solicitud
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={entradas}
          pagination={{
            page,
            pageSize,
            count: total,
            onPageChange: setPage,
          }}
        />
      )}

      {entradas.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#c41230]" />
            <span>Recuerda aprobar o rechazar solicitudes desde el panel de aprobación.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntradasList;
