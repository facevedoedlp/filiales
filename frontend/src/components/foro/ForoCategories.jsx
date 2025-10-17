import Badge from '../common/Badge.jsx';

const ForoCategories = ({ categorias = [], etiquetas = [], onSelectCategoria, onSelectEtiqueta, selectedCategoria }) => {
  return (
    <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Categorías</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategoria(null)}
              className={`w-full rounded-lg px-3 py-2 text-left transition ${
                selectedCategoria ? 'hover:bg-red-50' : 'bg-red-100 text-red-700'
              }`}
            >
              Todas
            </button>
          </li>
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <button
                type="button"
                onClick={() => onSelectCategoria(categoria.codigo)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                  selectedCategoria === categoria.codigo
                    ? 'bg-red-100 text-red-700'
                    : 'hover:bg-red-50'
                }`}
              >
                <span>{categoria.nombre}</span>
                <Badge variant="neutral">{categoria.totalTemas}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Etiquetas populares</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {etiquetas.map((tag) => (
            <button
              key={tag.nombre}
              type="button"
              onClick={() => onSelectEtiqueta(tag.nombre)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 transition hover:bg-red-100 hover:text-red-700"
            >
              #{tag.nombre} ({tag.cantidad})
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ForoCategories;
