import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const HiloCard = ({ hilo }) => {
  return (
    <Link
      to={`/foro/hilo/${hilo.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-slate-900">{hilo.titulo}</h4>
        {hilo.esta_cerrado && <Badge variant="warning">Cerrado</Badge>}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{hilo.descripcion}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>Por {hilo.autor_nombre}</span>
        <span>Respuestas: {hilo.respuestas_count}</span>
        <span>{formatDateTime(hilo.creado)}</span>
      </div>
    </Link>
  );
};

export default HiloCard;
