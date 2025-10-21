import { Card } from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const EntradaCard = ({ entrada, actions }) => {
  return (
    <Card
      title={entrada.evento}
      description={`Solicitadas por ${entrada.solicitante_nombre}`}
      actions={actions}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="info">{formatDate(entrada.fecha_evento)}</Badge>
        <Badge variant={entrada.estado === 'APROBADA' ? 'success' : entrada.estado === 'RECHAZADA' ? 'warning' : 'info'}>
          {entrada.estado}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-slate-600">Cantidad: {entrada.cantidad}</p>
      {entrada.motivo && <p className="mt-2 text-sm text-slate-500">Motivo: {entrada.motivo}</p>}
    </Card>
  );
};

export default EntradaCard;
