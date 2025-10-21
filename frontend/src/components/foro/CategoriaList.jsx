import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export const CategoriaList = ({ categorias, onCreate }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Categorías</h3>
        <Button size="sm" onClick={onCreate}>
          Nueva categoría
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categorias.map((categoria) => (
          <Link
            key={categoria.slug}
            to={`/foro/categoria/${categoria.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow"
          >
            <h4 className="text-base font-semibold text-red-600">{categoria.nombre}</h4>
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">{categoria.descripcion}</p>
          </Link>
        ))}
        {categorias.length === 0 && <p className="text-sm text-slate-500">Aún no hay categorías.</p>}
      </div>
    </div>
  );
};

export default CategoriaList;
