import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import {
  useCategoriasForo,
  useEtiquetasForo,
  useTemas,
} from '../../hooks/useForo.js';
import SearchBar from '../../components/common/SearchBar.jsx';
import Select from '../../components/common/Select.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ForoTemaCard from '../../components/foro/ForoTemaCard.jsx';
import ForoCategories from '../../components/foro/ForoCategories.jsx';

const ordenOptions = [
  { value: 'recientes', label: 'Recientes' },
  { value: 'populares', label: 'Populares' },
  { value: 'mas-respondidos', label: 'Más respondidos' },
];

const ForoHome = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ categoria: null, etiqueta: null, orden: 'recientes', busqueda: '' });
  const queryFilters = { ...filters };
  Object.keys(queryFilters).forEach((key) => {
    if (!queryFilters[key]) {
      delete queryFilters[key];
    }
  });
  const { data: temasData, isLoading } = useTemas({ page, limit: 10, ...queryFilters });
  const { data: categoriasData } = useCategoriasForo();
  const { data: etiquetasData } = useEtiquetasForo();

  const temas = temasData?.data?.items || [];
  const pagination = temasData?.data?.pagination;

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <SearchBar
            placeholder="Buscar temas o palabras clave"
            onSearch={(value) => {
              setFilters((prev) => ({ ...prev, busqueda: value }));
              setPage(1);
            }}
            className="md:flex-1"
          />
          <Select
            label="Orden"
            options={ordenOptions}
            value={ordenOptions.find((option) => option.value === filters.orden)}
            onChange={(option) => {
              setFilters((prev) => ({ ...prev, orden: option.value }));
              setPage(1);
            }}
          />
          <Link to="/foro/nuevo">
            <Button>Nuevo tema</Button>
          </Link>
        </div>

        {isLoading ? (
          <Loading message="Cargando temas" />
        ) : temas.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Aún no hay temas"
            description="Sé el primero en iniciar una conversación en el foro."
            actionLabel="Crear tema"
            onAction={() => navigate('/foro/nuevo')}
          />
        ) : (
          <div className="space-y-4">
            {temas.map((tema) => (
              <ForoTemaCard key={tema.id} tema={tema} />
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

      <div className="space-y-4">
        <ForoCategories
          categorias={categoriasData?.data || []}
          etiquetas={etiquetasData?.data || []}
          onSelectCategoria={(categoria) => {
            setFilters((prev) => ({ ...prev, categoria }));
            setPage(1);
          }}
          onSelectEtiqueta={(etiqueta) => {
            setFilters((prev) => ({ ...prev, etiqueta }));
            setPage(1);
          }}
          selectedCategoria={filters.categoria}
        />
      </div>
    </div>
  );
};

export default ForoHome;
