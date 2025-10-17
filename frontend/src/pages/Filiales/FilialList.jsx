import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, Pencil, PowerOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import {
  useDeleteFilial,
  useFiliales,
} from '../../hooks/useFiliales.js';
import Button from '../../components/common/Button.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import Table from '../../components/common/Table.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Badge from '../../components/common/Badge.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Select from '../../components/common/Select.jsx';

const FilialList = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ esActiva: true, provinciaId: null, busqueda: '' });
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryFilters = { ...filters };
  Object.keys(queryFilters).forEach((key) => {
    if (queryFilters[key] === null || queryFilters[key] === '') {
      delete queryFilters[key];
    }
  });

  const { data, isLoading } = useFiliales({ page, limit: 20, ...queryFilters });
  const deleteFilial = useDeleteFilial();

  const provinciasOptions = useMemo(() => {
    const unique = new Map();
    data?.data?.items?.forEach((filial) => {
      if (filial.provinciaId && filial.provinciaNombre && !unique.has(filial.provinciaId)) {
        unique.set(filial.provinciaId, {
          value: filial.provinciaId,
          label: filial.provinciaNombre,
        });
      }
    });
    return Array.from(unique.values());
  }, [data]);

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.nombre}</p>
          <p className="text-xs text-slate-500">{row.localidadNombre}</p>
        </div>
      ),
    },
    {
      header: 'Contacto',
      accessor: 'mailInstitucional',
      render: (row) => (
        <div className="space-y-1 text-xs">
          {row.mailInstitucional ? <p>{row.mailInstitucional}</p> : null}
          {row.telefono ? <p>{row.telefono}</p> : null}
        </div>
      ),
    },
    {
      header: 'Provincia',
      accessor: 'provinciaNombre',
      sortable: true,
    },
    {
      header: 'Integrantes',
      accessor: 'totalIntegrantes',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold text-slate-700">{row.totalIntegrantes ?? 0}</span>
      ),
    },
    {
      header: 'Estado',
      accessor: 'esActiva',
      render: (row) => (
        <Badge variant={row.esActiva ? 'success' : 'danger'}>
          {row.esActiva ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
  ];

  const handleDeactivate = async () => {
    if (!confirmId) return;
    await deleteFilial.mutateAsync(confirmId);
    setConfirmId(null);
  };

  const pagination = data?.data?.pagination;
  const items = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Filiales</h1>
          <p className="text-sm text-slate-500">Administrá las filiales del club en todo el país.</p>
        </div>
        {user?.rol === 'ADMIN' ? (
          <Link to="/filiales/nueva">
            <Button className="bg-red-600 text-white hover:bg-red-700">Nueva Filial</Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <SearchBar
          placeholder="Buscar por nombre o localidad"
          onSearch={(value) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, busqueda: value }));
          }}
          className="md:col-span-2"
        />

        <Select
          label="Estado"
          value={filters.esActiva ? { value: true, label: 'Activas' } : { value: false, label: 'Inactivas' }}
          onChange={(option) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, esActiva: option.value }));
          }}
          options={[
            { value: true, label: 'Activas' },
            { value: false, label: 'Inactivas' },
          ]}
        />

        <Select
          label="Provincia"
          value={provinciasOptions.find((option) => option.value === filters.provinciaId) || null}
          onChange={(option) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, provinciaId: option?.value ?? null }));
          }}
          options={provinciasOptions}
          placeholder="Todas"
        />
      </div>

      {isLoading ? (
        <Loading message="Cargando filiales" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No encontramos filiales"
          description="Intenta modificar los filtros o crear una nueva filial."
          actionLabel={user?.rol === 'ADMIN' ? 'Crear filial' : undefined}
          onAction={user?.rol === 'ADMIN' ? () => navigate('/filiales/nueva') : undefined}
        />
      ) : (
        <Table
          columns={columns}
          data={items}
          loading={isLoading}
          onRowClick={(row) => navigate(`/filiales/${row.id}`)}
          actions={(row) => (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/filiales/${row.id}`);
                }}
              >
                <Eye className="mr-1 h-4 w-4" /> Ver
              </Button>
              {(user?.rol === 'ADMIN' || user?.rol === 'COORDINADOR') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/filiales/${row.id}/editar`);
                  }}
                >
                  <Pencil className="mr-1 h-4 w-4" /> Editar
                </Button>
              )}
              {user?.rol === 'ADMIN' && row.esActiva ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={(event) => {
                    event.stopPropagation();
                    setConfirmId(row.id);
                  }}
                >
                  <PowerOff className="mr-1 h-4 w-4" /> Desactivar
                </Button>
              ) : null}
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
        open={Boolean(confirmId)}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDeactivate}
        description="La filial dejará de estar activa en el sistema."
        confirmLabel={deleteFilial.isPending ? 'Desactivando...' : 'Desactivar'}
      />
    </div>
  );
};

export default FilialList;
