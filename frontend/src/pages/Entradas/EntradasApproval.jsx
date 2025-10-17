import { useMemo, useState } from 'react';
import { usePedidosEntradas, useGestionPedidoEntrada, useFixture } from '../../hooks/useEntradas.js';
import { useFiliales } from '../../hooks/useFiliales.js';
import Table from '../../components/common/Table.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const estadoBadge = {
  PENDIENTE: 'warning',
  APROBADO: 'success',
  RECHAZADO: 'danger',
};

const EntradasApproval = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ fixtureId: null, filialId: null, aprobacionSocios: 'PENDIENTE' });
  const [selected, setSelected] = useState([]);
  const { data: fixturesData } = useFixture({ proximos: true, limit: 50 });
  const { data: filialesData } = useFiliales({ page: 1, limit: 200 });
  const queryFilters = { ...filters };
  Object.keys(queryFilters).forEach((key) => {
    if (queryFilters[key] === null || queryFilters[key] === '') {
      delete queryFilters[key];
    }
  });
  const { data, isLoading } = usePedidosEntradas({ page, limit: 20, ...queryFilters });
  const gestionPedido = useGestionPedidoEntrada();

  const pedidos = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const fixtureOptions = fixturesData?.data?.items?.map((fixture) => ({
    value: fixture.id,
    label: `${fixture.rival} - ${new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(fixture.fecha))}`,
  })) || [];

  const filialesOptions = filialesData?.data?.items?.map((filial) => ({
    value: filial.id,
    label: filial.nombre,
  })) || [];

  const toggleSelection = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBatchAction = async (action) => {
    await Promise.all(selected.map((id) => gestionPedido.mutateAsync({ id, action })));
    setSelected([]);
  };

  const columns = useMemo(
    () => [
      {
        header: '',
        accessor: 'checkbox',
        render: (row) => (
          <input
            type="checkbox"
            checked={selected.includes(row.id)}
            onChange={() => toggleSelection(row.id)}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
      },
      {
        header: 'Partido',
        accessor: 'fixture',
        render: (row) => row.fixture?.rival || '—',
      },
      {
        header: 'Filial',
        accessor: 'filialNombre',
      },
      {
        header: 'Personas',
        accessor: 'personas',
        render: (row) => row.personas?.length || 0,
      },
      {
        header: 'Estado',
        accessor: 'aprobacionSocios',
        render: (row) => (
          <Badge variant={estadoBadge[row.aprobacionSocios] || 'neutral'}>
            {row.aprobacionSocios}
          </Badge>
        ),
      },
    ],
    [selected]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de pedidos</h1>
          <p className="text-sm text-slate-500">
            Aprobá o rechazá las solicitudes de entradas de forma masiva.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleBatchAction('aprobar')}
            disabled={!selected.length || gestionPedido.isPending}
          >
            Aprobar seleccionados
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBatchAction('rechazar')}
            disabled={!selected.length || gestionPedido.isPending}
          >
            Rechazar seleccionados
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <Select
          label="Partido"
          options={fixtureOptions}
          value={fixtureOptions.find((option) => option.value === filters.fixtureId) || null}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, fixtureId: option?.value ?? null }));
            setPage(1);
          }}
          placeholder="Todos"
        />
        <Select
          label="Filial"
          options={filialesOptions}
          value={filialesOptions.find((option) => option.value === filters.filialId) || null}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, filialId: option?.value ?? null }));
            setPage(1);
          }}
          placeholder="Todas"
        />
        <Select
          label="Estado"
          options={[
            { value: 'PENDIENTE', label: 'Pendiente' },
            { value: 'APROBADO', label: 'Aprobado' },
            { value: 'RECHAZADO', label: 'Rechazado' },
          ]}
          value={filters.aprobacionSocios ? { value: filters.aprobacionSocios, label: filters.aprobacionSocios } : null}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, aprobacionSocios: option?.value ?? null }));
            setPage(1);
          }}
          placeholder="Todos"
        />
      </div>

      {isLoading ? (
        <Loading message="Cargando pedidos" />
      ) : pedidos.length === 0 ? (
        <EmptyState
          title="Sin pedidos pendientes"
          description="No hay solicitudes para mostrar con los filtros actuales."
        />
      ) : (
        <Table columns={columns} data={pedidos} loading={isLoading} />
      )}

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
};

export default EntradasApproval;
