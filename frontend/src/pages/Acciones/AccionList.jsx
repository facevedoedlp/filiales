import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, CalendarClock, MapPin, Users } from 'lucide-react';
import { useAcciones } from '../../hooks/useAcciones.js';
import { useFiliales } from '../../hooks/useFiliales.js';
import SearchBar from '../../components/common/SearchBar.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';

const AccionList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tipo: null, fechaDesde: null, fechaHasta: null, filialId: null, busqueda: '' });
  const { data: filialesData } = useFiliales({ page: 1, limit: 200, esActiva: true });
  const { data, isLoading } = useAcciones({ page, limit: 10, ...filters });

  const acciones = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const filialesOptions = filialesData?.data?.items?.map((filial) => ({
    value: filial.id,
    label: filial.nombre,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Acciones</h1>
          <p className="text-sm text-slate-500">Registrá y seguí las acciones realizadas por las filiales.</p>
        </div>
        <Link to="/acciones/nueva">
          <Button>Registrar acción</Button>
        </Link>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <Select
          label="Filial"
          value={filialesOptions.find((option) => option.value === filters.filialId) || null}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, filialId: option?.value ?? null }));
            setPage(1);
          }}
          options={filialesOptions}
          placeholder="Todas"
        />

        <Select
          label="Tipo"
          value={filters.tipo ? { value: filters.tipo, label: filters.tipo } : null}
          onChange={(option) => {
            setFilters((prev) => ({ ...prev, tipo: option?.value ?? null }));
            setPage(1);
          }}
          options={[
            { value: 'Filial', label: 'Filial' },
            { value: 'Captación', label: 'Captación' },
          ]}
          placeholder="Todos"
        />

        <InputDate
          label="Desde"
          value={filters.fechaDesde || ''}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, fechaDesde: value || null }));
            setPage(1);
          }}
        />

        <InputDate
          label="Hasta"
          value={filters.fechaHasta || ''}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, fechaHasta: value || null }));
            setPage(1);
          }}
        />

        <SearchBar
          placeholder="Buscar por título o descripción"
          onSearch={(value) => {
            setFilters((prev) => ({ ...prev, busqueda: value }));
            setPage(1);
          }}
          className="md:col-span-2"
        />
      </div>

      {isLoading ? (
        <Loading message="Cargando acciones" />
      ) : acciones.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No hay acciones registradas"
          description="Cuando registres acciones de las filiales aparecerán acá."
          actionLabel="Registrar acción"
          onAction={() => navigate('/acciones/nueva')}
        />
      ) : (
        <div className="space-y-4">
          {acciones.map((accion) => (
            <article
              key={accion.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-red-300"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{accion.titulo}</h2>
                  <p className="text-sm text-slate-500">{accion.descripcion}</p>
                </div>
                <Link to={`/acciones/${accion.id}`} className="text-sm font-medium text-red-600 hover:underline">
                  Ver detalle
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(accion.fecha))}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {accion.ubicacion || 'Sin ubicación'}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {accion.filialNombre || '—'}
                </span>
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> {accion.imagenes?.length || 0} imágenes
                </span>
              </div>
            </article>
          ))}
        </div>
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

const InputDate = ({ label, value, onChange }) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
    />
  </label>
);

export default AccionList;
