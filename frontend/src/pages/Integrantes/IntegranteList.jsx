<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
=======
import { useMemo, useState, useEffect } from 'react';
>>>>>>> ad3da76 (cambios ok)
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
<<<<<<< HEAD
  const isGlobalAdmin = user?.rol === 'ADMIN_GLOBAL';
  const [filialId, setFilialId] = useState(isGlobalAdmin ? null : user?.filial_id ?? null);
=======
  const [filialId, setFilialId] = useState(null);
>>>>>>> ad3da76 (cambios ok)
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ es_activo: null, cargo: null, busqueda: '' });
  const [confirmToggle, setConfirmToggle] = useState(null);

<<<<<<< HEAD
  const { data: filialesData } = useFiliales({ page: 1, limit: 200, esActiva: true });
  const resolvedFilialId = isGlobalAdmin ? filialId : user?.filial_id ?? null;
  const integranteParams = {
    page,
    limit: 20,
    filial_id: resolvedFilialId,
    busqueda: filters.busqueda,
    cargo: filters.cargo,
    es_activo: filters.es_activo,
  };

  const { data, isLoading } = useIntegrantes(integranteParams);
=======
  // Cargar filiales
  const { data: filialesData, isLoading: loadingFiliales } = useFiliales({ 
    page: 1, 
    limit: 200, 
    esActiva: true 
  });

  const filialOptions = useMemo(() => {
    return (
      filialesData?.data?.filiales?.map((filial) => ({
        value: filial.id,
        label: filial.nombre,
      })) || []
    );
  }, [filialesData]);

  // ✅ Auto-seleccionar la primera filial si no hay ninguna seleccionada
  useEffect(() => {
    if (!filialId && filialOptions.length > 0) {
      // Si el usuario tiene una filial asignada, usar esa
      if (user?.filialId && filialOptions.find(f => f.value === user.filialId)) {
        setFilialId(user.filialId);
      } else {
        // Si no, usar la primera de la lista
        setFilialId(filialOptions[0].value);
      }
    }
  }, [filialOptions, filialId, user?.filialId]);

  // Preparar parámetros de búsqueda
  const queryFilters = { ...filters };
  Object.keys(queryFilters).forEach((key) => {
    if (queryFilters[key] === null || queryFilters[key] === '') {
      delete queryFilters[key];
    }
  });

  const integranteParams = { 
    page, 
    limit: 20, 
    ...queryFilters,
    filialId // ✅ Siempre incluir filialId
  };

  // ✅ Solo hacer la query si hay filialId
  const { data, isLoading } = useIntegrantes(integranteParams, {
    enabled: Boolean(filialId)
  });
  
>>>>>>> ad3da76 (cambios ok)
  const toggleIntegrante = useToggleIntegrante();

  useEffect(() => {
    if (!isGlobalAdmin) {
      setFilialId(user?.filial_id ?? null);
    }
  }, [isGlobalAdmin, user?.filial_id]);

  const integrantes = data?.data?.items || [];
  const pagination = data?.data?.pagination;

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
      accessor: 'es_activo',
      render: (row) => (
        <Badge variant={row.es_activo ? 'success' : 'danger'}>
          {row.es_activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  // ✅ Mostrar loading mientras se cargan las filiales
  if (loadingFiliales) {
    return <Loading message="Cargando filiales..." />;
  }

  // ✅ Si no hay filiales en el sistema
  if (filialOptions.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No hay filiales disponibles"
        description="Primero necesitas crear al menos una filial para poder gestionar integrantes."
        actionLabel={user?.rol === 'ADMIN' ? 'Crear filial' : undefined}
        onAction={user?.rol === 'ADMIN' ? () => window.location.href = '/filiales/nueva' : undefined}
      />
    );
  }

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
          <Button disabled={!resolvedFilialId}>Agregar integrante</Button>
        </Link>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        {isGlobalAdmin ? (
          <Select
            label="Filial"
            value={filialOptions.find((option) => option.value === filialId) || null}
            onChange={(option) => {
              setFilialId(option?.value ?? null);
              setPage(1);
            }}
            options={filialOptions}
            placeholder="Todas las filiales"
          />
        ) : null}

        <SearchBar
          placeholder="Buscar por nombre"
          onSearch={(value) => {
            setFilters((prev) => ({ ...prev, busqueda: value }));
            setPage(1);
          }}
          className={isGlobalAdmin ? 'md:col-span-2' : 'md:col-span-3'}
        />

        <Select
          label="Estado"
          value=
            [
              { value: null, label: 'Todos' },
              { value: true, label: 'Activos' },
              { value: false, label: 'Inactivos' },
            ].find((option) => option.value === filters.es_activo) || {
              value: null,
              label: 'Todos',
            }
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, es_activo: option?.value ?? null }));
            setPage(1);
          }}
          options={[
            { value: null, label: 'Todos' },
            { value: true, label: 'Activos' },
            { value: false, label: 'Inactivos' },
          ]}
        />

        {cargoOptions.length > 0 && (
          <Select
            label="Cargo"
            value={cargoOptions.find((option) => option.value === filters.cargo) || null}
            onChange={(option) => {
              setFilters((prev) => ({ ...prev, cargo: option?.value ?? null }));
              setPage(1);
            }}
            options={cargoOptions}
            placeholder="Todos"
            className="md:col-span-4"
          />
        )}
      </div>

      {isLoading ? (
<<<<<<< HEAD
        <Loading message="Cargando integrantes" />
=======
        <Loading message="Cargando integrantes..." />
>>>>>>> ad3da76 (cambios ok)
      ) : integrantes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin integrantes"
          description="No hay integrantes registrados en esta filial con los filtros seleccionados."
          actionLabel="Agregar primer integrante"
          onAction={() => window.location.href = '/integrantes/nuevo'}
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
                    activo: !row.es_activo,
                    nombre: row.nombre,
                    filial_id: row.filial_id,
                  })
                }
              >
                {row.es_activo ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          )}
        />
      )}

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
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