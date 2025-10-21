import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { Card } from '../common/Card';
import { ROLES_LABELS } from '../../utils/constants';

export const IntegranteCard = ({ integrante, onToggleEstado }) => {
  return (
    <Card
      title={integrante.nombre}
      description={integrante.filial_nombre}
      actions={
        <button
          onClick={() => onToggleEstado?.(integrante)}
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {integrante.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
        </button>
      }
    >
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{ROLES_LABELS[integrante.rol] || integrante.rol}</Badge>
          <Badge variant={integrante.estado === 'ACTIVO' ? 'success' : 'warning'}>
            {integrante.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <p className="text-slate-500">{integrante.email}</p>
        <Link
          to={`/integrantes/${integrante.id}`}
          className="inline-flex items-center text-sm font-semibold text-red-600 hover:underline"
        >
          Ver detalle →
        </Link>
      </div>
    </Card>
  );
};

export default IntegranteCard;
