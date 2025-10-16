import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

const ForoTema = ({ tema }) => {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/foro/${tema.id}`} className="text-lg font-semibold text-primary hover:underline">
            {tema.titulo}
          </Link>
          <p className="mt-1 text-sm text-slate-600">{tema.contenido}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{tema.categoria}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <MessageCircle size={16} /> {tema.respuestas?.length ?? 0}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">Publicado: {formatDate(tema.createdAt)}</p>
    </article>
  );
};

export default ForoTema;
