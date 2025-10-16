import { formatDate } from '../../utils/formatters.js';

const ForoRespuesta = ({ respuesta }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">{respuesta.contenido}</p>
      <p className="mt-2 text-xs text-slate-400">
        Publicado el {formatDate(respuesta.createdAt)}
      </p>
    </div>
  );
};

export default ForoRespuesta;
