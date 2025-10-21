import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const FilialCard = ({ filial, onEdit, onDelete }) => {
  return (
    <Card
      title={filial.nombre}
      description={filial.direccion}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit?.(filial)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete?.(filial.id)}>
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4 text-red-500" /> {filial.ciudad}
          </span>
          <span className="inline-flex items-center gap-2 text-slate-600">
            <Users className="h-4 w-4 text-red-500" /> {filial.integrantes_count || 0} integrantes
          </span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-3">{filial.descripcion}</p>
        <div className="flex justify-end">
          <Link
            to={`/filiales/${filial.id}`}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default FilialCard;
