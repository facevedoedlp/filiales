import { useMemo, useState } from 'react';
import { CalendarDays, ShieldCheck, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import PartidoForm from '../../components/partidos/PartidoForm';
import { usePartidos } from '../../hooks/usePartidos';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'PROGRAMADO', label: 'Programado' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const PartidosList = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState(null);

  const listFilters = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...(user?.rol === ROLES.ADMIN ? {} : { habilitado: true }),
      ...filters,
    }),
    [page, pageSize, filters, user]
  );

  const { data, partidos, isLoading, isError, error, pagination, createPartido, updatePartido } =
    usePartidos(listFilters);

  const total = pagination?.count ?? partidos.length;

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      cupo_total: values.cupo_total ? Number(values.cupo_total) : null,
      habilitado: Boolean(values.habilitado),
      solo_socios: Boolean(values.solo_socios),
    };
    if (selectedPartido) {
      await updatePartido({ id: selectedPartido.id, data: payload });
    } else {
      await createPartido(payload);
    }
    setIsModalOpen(false);
    setSelectedPartido(null);
  };

  const toggleHabilitado = async (partido) => {
    await updatePartido({
      id: partido.id,
      data: { habilitado: !partido.habilitado },
      method: 'patch',
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartido(null);
  };

  const columns = [
    {
      key: 'titulo',
      header: 'Partido',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.titulo}</p>
          <p className="text-xs text-slate-500">{row.lugar}</p>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (row) => formatDate(row.fecha),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge
          variant={
            row.estado === 'PROGRAMADO'
              ? 'info'
              : row.estado === 'CERRADO'
              ? 'success'
              : 'warning'
          }
        >
          {row.estado}
        </Badge>
      ),
    },
    {
      key: 'acceso',
      header: 'Acceso',
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={row.habilitado ? 'success' : 'warning'}>
            {row.habilitado ? 'Habilitado' : 'Deshabilitado'}
          </Badge>
          {row.solo_socios ? (
            <Badge variant="info">Solo socios</Badge>
          ) : (
            <Badge variant="default">No socios</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'cupo',
      header: 'Cupo',
      cell: (row) =>
        row.cupo_total ? `${row.cupo_disponible ?? row.cupo_total}/${row.cupo_total}` : 'Sin cupo',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (row) =>
        user?.rol === ROLES.ADMIN ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedPartido(row);
                setIsModalOpen(true);
              }}
            >
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleHabilitado(row)}>
              {row.habilitado ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ) : null,
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
        title="No pudimos cargar los partidos"
        description={error?.message || 'Revisa tu conexion e intenta nuevamente.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Partidos</h1>
          <p className="text-sm text-slate-500">Gestiona los partidos y el acceso a solicitudes.</p>
        </div>
        {user?.rol === ROLES.ADMIN && (
          <Button leftIcon={<CalendarDays className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            Nuevo partido
          </Button>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="Titulo o lugar"
          value={filters.search || ''}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, search: event.target.value || undefined }));
            setPage(1);
          }}
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
        <Select
          label="Habilitado"
          value={filters.habilitado ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            setFilters((prev) => ({
              ...prev,
              habilitado: value === '' ? undefined : value === 'true',
            }));
            setPage(1);
          }}
          options={[
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Habilitados' },
            { value: 'false', label: 'Deshabilitados' },
          ]}
        />
        <Select
          label="Solo socios"
          value={filters.solo_socios ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            setFilters((prev) => ({
              ...prev,
              solo_socios: value === '' ? undefined : value === 'true',
            }));
            setPage(1);
          }}
          options={[
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Solo socios' },
            { value: 'false', label: 'No socios' },
          ]}
        />
      </div>

      {partidos.length === 0 ? (
        <EmptyState
          title="No hay partidos cargados"
          description="Crea un partido para habilitar solicitudes de entradas."
          action={
            user?.rol === ROLES.ADMIN ? (
              <Button
                leftIcon={<CalendarDays className="h-4 w-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                Crear partido
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={partidos}
          pagination={{
            page,
            pageSize,
            count: total,
            onPageChange: setPage,
          }}
        />
      )}

      {partidos.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            {filters.habilitado === false ? (
              <Shield className="h-4 w-4 text-[#c41230]" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-[#c41230]" />
            )}
            <span>
              Solo los partidos habilitados aparecen para solicitar entradas.
            </span>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedPartido ? 'Editar partido' : 'Nuevo partido'}
      >
        <PartidoForm
          defaultValues={
            selectedPartido || {
              habilitado: true,
              solo_socios: false,
              estado: 'PROGRAMADO',
            }
          }
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default PartidosList;
