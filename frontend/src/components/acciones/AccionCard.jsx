import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const AccionCard = ({ accion, onDelete }) => {
  return (
    <Card
      title={accion.nombre}
      description={accion.filial_nombre}
      actions={
        <button
          onClick={() => onDelete?.(accion.id)}
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Eliminar
        </button>
      }
    >
      <div className="space-y-3">
        {(accion.imagen_principal_url || accion.imagen_principal) && (
          <img
            src={accion.imagen_principal_url || accion.imagen_principal}
            alt={accion.nombre}
            className="h-48 w-full rounded-md object-cover"
          />
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="info">{formatDate(accion.fecha)}</Badge>
          <Badge variant="success">{accion.estado}</Badge>
        </div>
        <p className="text-sm text-slate-600 line-clamp-3">{accion.descripcion}</p>
        <div className="flex justify-end">
          <Link
            to={`/acciones/${accion.id}`}
            className="inline-flex items-center text-sm font-semibold text-red-600 hover:underline"
          >
            Ver detalle →
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default AccionCard;
