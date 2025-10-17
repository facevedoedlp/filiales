import { Link } from 'react-router-dom';
import { MessageCircle, Pin, UserCircle } from 'lucide-react';
import Badge from '../common/Badge.jsx';

const ForoTemaCard = ({ tema }) => {
  return (
    <article className={`rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-red-300 ${tema.destacado ? 'relative shadow-lg' : ''}`}>
      {tema.destacado ? (
        <div className="absolute -top-3 left-5 flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          <Pin className="h-3 w-3" /> Destacado
        </div>
      ) : null}
      <Link to={`/foro/tema/${tema.id}`} className="block">
        <h2 className="text-xl font-semibold text-slate-900">{tema.titulo}</h2>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{tema.descripcion}</p>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <UserCircle className="h-4 w-4" /> {tema.autorNombre} · {tema.filialNombre}
        </span>
        <Badge variant="info">{tema.categoria}</Badge>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {tema.totalRespuestas} respuestas
        </span>
        <span>{new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(tema.actualizadoEn))}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tema.etiquetas?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
};

export default ForoTemaCard;
