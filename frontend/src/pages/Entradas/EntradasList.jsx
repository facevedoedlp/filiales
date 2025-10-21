import { useState } from 'react';
import Spinner from '../../components/common/Spinner';
import { useEntradas } from '../../hooks/useEntradas';
import { useFiliales } from '../../hooks/useFiliales';
import EntradaTable from '../../components/entradas/EntradaTable';
import Select from '../../components/common/Select';
import { ESTADOS_ENTRADA } from '../../utils/constants';

const EntradasList = () => {
  const [filters, setFilters] = useState({});
  const { entradas, isLoading } = useEntradas(filters);
  const { filiales } = useFiliales();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de entradas</h1>
        <p className="text-sm text-slate-500">Consulta las solicitudes realizadas y su estado actual.</p>
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
          options={ESTADOS_ENTRADA}
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
        <EntradaTable entradas={entradas} />
      )}
    </div>
  );
};

export default EntradasList;
