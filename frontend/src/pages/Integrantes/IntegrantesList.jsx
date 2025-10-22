import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { IntegranteForm } from '../../components/integrantes/IntegranteForm';
import { useAuth } from '../../hooks/useAuth';
import { useFiliales } from '../../hooks/useFiliales';
import { useIntegrantes } from '../../hooks/useIntegrantes';
import { ESTADOS_INTEGRANTE, ROLES, ROLES_LABELS } from '../../utils/constants';

const IntegrantesList = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegrante, setSelectedIntegrante] = useState(null);

  const listFilters = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...filters,
    }),
    [page, filters, pageSize]
  );

  const { data, isLoading, isError, error, pagination, createIntegrante, updateIntegrante, changeEstado } =
    useIntegrantes(listFilters);
  const { filiales } = useFiliales(useMemo(() => ({ page_size: 200 }), []));

  const integrantes = data?.resultados || data?.results || [];
  const total = pagination.count ?? integrantes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filialesOptions = filiales.map((filial) => ({ value: filial.id, label: filial.nombre }));

  const handleSubmit = async (values) => {
    if (selectedIntegrante) {
      await updateIntegrante({ id: selectedIntegrante.id, data: values });
    } else {
      await createIntegrante(values);
    }
    setIsModalOpen(false);
    setSelectedIntegrante(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIntegrante(null);
  };

  const toggleEstado = async (integrante) => {
    await changeEstado({
      id: integrante.id,
      data: { estado: integrante.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' },
    });
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Integrante',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.nombre}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      cell: (row) => <Badge>{ROLES_LABELS[row.rol] || row.rol}</Badge>,
    },
    {
      key: 'filial',
      header: 'Filial',
      cell: (row) => row.filial_nombre || row.filial?.nombre || 'Sin asignar',
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={row.estado === 'ACTIVO' ? 'success' : 'warning'}>
          {row.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          {user?.rol !== ROLES.INTEGRANTE && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedIntegrante(row);
                setIsModalOpen(true);
              }}
            >
              Editar
            </Button>
          )}
          {user?.rol !== ROLES.INTEGRANTE && (
            <Button variant="ghost" size="sm" onClick={() => toggleEstado(row)}>
              {row.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
            </Button>
          )}
        </div>
      ),
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
        title="No pudimos cargar los integrantes"
        description={error?.message || 'Revisa tu conexión e intenta nuevamente.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Integrantes</h1>
          <p className="text-sm text-slate-500">Gestiona los integrantes y roles de las filiales.</p>
        </div>
        {user?.rol !== ROLES.INTEGRANTE && (
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            Nuevo integrante
          </Button>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="Nombre o correo"
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
          options={[{ value: '', label: 'Todos' }, ...ESTADOS_INTEGRANTE]}
        />
        <Select
          label="Rol"
          value={filters.rol || ''}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, rol: event.target.value || undefined }));
            setPage(1);
          }}
          options={[{ value: '', label: 'Todos' }, ...Object.values(ROLES).map((rol) => ({ value: rol, label: ROLES_LABELS[rol] }))]}
        />
      </div>

      {integrantes.length === 0 ? (
        <EmptyState
          title="No hay integrantes para mostrar"
          description="Ajusta los filtros o crea un nuevo integrante."
          action=
            {user?.rol !== ROLES.INTEGRANTE ? (
              <Button onClick={() => setIsModalOpen(true)}>Registrar integrante</Button>
            ) : undefined}
        />
      ) : (
        <Table
          columns={columns}
          data={integrantes}
          pagination={{
            page,
            pageSize,
            count: total,
            onPageChange: setPage,
          }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedIntegrante ? 'Editar integrante' : 'Nuevo integrante'}
      >
        <IntegranteForm
          defaultValues={
            selectedIntegrante || {
              filial: user?.filial_id || filialesOptions[0]?.value,
            }
          }
          filialesOptions={filialesOptions}
          onSubmit={handleSubmit}
        />
        {selectedIntegrante && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={() => toggleEstado(selectedIntegrante)}>
              {selectedIntegrante.estado === 'ACTIVO' ? 'Desactivar integrante' : 'Activar integrante'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IntegrantesList;
