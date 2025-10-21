import { useState } from 'react';
import Spinner from '../../components/common/Spinner';
import { useAcciones } from '../../hooks/useAcciones';
import { useFiliales } from '../../hooks/useFiliales';
import { AccionCard } from '../../components/acciones/AccionCard';
import Select from '../../components/common/Select';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { Link } from 'react-router-dom';

const AccionesList = () => {
  const [filters, setFilters] = useState({});
  const { user } = useAuth();
  const { acciones, isLoading, deleteAccion } = useAcciones(filters);
  const { filiales } = useFiliales();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Acciones</h1>
          <p className="text-sm text-slate-500">Visualiza y gestiona las acciones solidarias realizadas.</p>
        </div>
        {user?.rol !== ROLES.INTEGRANTE && (
          <Link
            to="/acciones/nueva"
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Nueva acción
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Filial"
          options={filiales?.map((filial) => ({ value: filial.id, label: filial.nombre })) || []}
          value={filters.filial || ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, filial: event.target.value || undefined }))}
        />
        <Select
          label="Estado"
          options={[
            { value: 'PROGRAMADA', label: 'Programada' },
            { value: 'EN_CURSO', label: 'En curso' },
            { value: 'FINALIZADA', label: 'Finalizada' },
          ]}
          value={filters.estado || ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, estado: event.target.value || undefined }))}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Fecha desde
          <input
            type="date"
            value={filters.desde || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, desde: event.target.value || undefined }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {acciones.map((accion) => (
            <AccionCard key={accion.id} accion={accion} onDelete={user?.rol !== ROLES.INTEGRANTE ? deleteAccion : undefined} />
          ))}
          {acciones.length === 0 && <p className="col-span-full text-sm text-slate-500">No se encontraron acciones.</p>}
        </div>
      )}
    </div>
  );
};

export default AccionesList;
