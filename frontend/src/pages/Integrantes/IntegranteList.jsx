import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useFiliales } from '../../hooks/useFiliales.js';
import {
  useIntegrantes,
  useToggleIntegrante,
} from '../../hooks/useIntegrantes.js';
import Table from '../../components/common/Table.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import Select from '../../components/common/Select.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

const IntegranteList = () => {
  const { user } = useAuthStore();
  const [filialId, setFilialId] = useState(user?.filialId || null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ esActivo: true, cargo: null, busqueda: '' });
  const [confirmToggle, setConfirmToggle] = useState(null);

  const { data: filialesData } = useFiliales({ page: 1, limit: 200, esActiva: true });
  const queryFilters = { ...filters };
  Object.keys(queryFilters).forEach((key) => {
    if (queryFilters[key] === null || queryFilters[key] === '') {
      delete queryFilters[key];
    }
  });
  const integranteParams = { page, limit: 20, ...queryFilters };
  if (filialId) {
    integranteParams.filialId = filialId;
  }
  const { data, isLoading } = useIntegrantes(integranteParams);
  const toggleIntegrante = useToggleIntegrante();

  const integrantes = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const filialOptions = useMemo(() => {
    return (
      filialesData?.data?.items?.map((filial) => ({
        value: filial.id,
        label: filial.nombre,
      })) || []
    );
  }, [filialesData]);

  const cargoOptions = useMemo(() => {
    const unique = new Set();
    integrantes.forEach((integrante) => {
      if (integrante.cargo) {
        unique.add(integrante.cargo);
      }
    });
    return Array.from(unique).map((cargo) => ({ value: cargo, label: cargo }));
  }, [integrantes]);

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.nombre}</p>
          <p className="text-xs text-slate-500">DNI {row.dni}</p>
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
      header: 'Cargo',
      accessor: 'cargo',
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Integrantes</h1>
          <p className="text-sm text-slate-500">
            Gestioná el padrón de integrantes y autoridades de cada filial.
          </p>
        </div>
        <Link to="/integrantes/nuevo">
          <Button disabled={!filialId}>Agregar integrante</Button>
        </Link>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <Select
          label="Filial"
          value={filialOptions.find((option) => option.value === filialId) || null}
          onChange={(option) => {
            setFilialId(option?.value ?? null);
            setPage(1);
          }}
          options={filialOptions}
          placeholder="Seleccioná una filial"
        />

        <SearchBar
          placeholder="Buscar por nombre"
          onSearch={(value) => {
            setFilters((prev) => ({ ...prev, busqueda: value }));
            setPage(1);
          }}
          className="md:col-span-2"
        />

        <Select
          label="Estado"
          value={filters.esActivo ? { value: true, label: 'Activos' } : { value: false, label: 'Inactivos' }}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, esActivo: option.value }));
            setPage(1);
          }}
          options={[
            { value: true, label: 'Activos' },
            { value: false, label: 'Inactivos' },
          ]}
        />

        <Select
          label="Cargo"
          value={cargoOptions.find((option) => option.value === filters.cargo) || null}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, cargo: option?.value ?? null }));
            setPage(1);
          }}
          options={cargoOptions}
          placeholder="Todos"
        />
      </div>

      {!filialId ? (
        <EmptyState
          icon={Users}
          title="Seleccioná una filial"
          description="Para ver el listado de integrantes primero elegí una filial."
        />
      ) : isLoading ? (
        <Loading message="Cargando integrantes" />
      ) : integrantes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin integrantes"
          description="No hay integrantes registrados con los filtros seleccionados."
        />
      ) : (
        <Table
          columns={columns}
          data={integrantes}
          loading={isLoading}
          actions={(row) => (
            <div className="flex gap-2">
              <Link to={`/integrantes/${row.id}`} className="text-sm text-red-600 hover:underline">
                Ver detalle
              </Link>
              <Link to={`/integrantes/${row.id}/editar`} className="text-sm text-slate-500 hover:underline">
                Editar
              </Link>
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={() =>
                  setConfirmToggle({
                    id: row.id,
                    activo: !row.esActivo,
                    nombre: row.nombre,
                    filialId,
                  })
                }
              >
                {row.esActivo ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          )}
        />
      )}

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={setPage}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmToggle)}
        onCancel={() => setConfirmToggle(null)}
        onConfirm={() => {
          toggleIntegrante.mutate(confirmToggle);
          setConfirmToggle(null);
        }}
        title={confirmToggle?.activo ? 'Reactivar integrante' : 'Desactivar integrante'}
        description={`Vas a ${confirmToggle?.activo ? 'reactivar' : 'desactivar'} a ${
          confirmToggle?.nombre || 'este integrante'
        }.`}
        confirmLabel={toggleIntegrante.isPending ? 'Procesando...' : 'Confirmar'}
      />
    </div>
  );
};

export default IntegranteList;
