import Badge from '../common/Badge';
import { Card } from '../common/Card';
import { formatDate } from '../../utils/formatters';
import { ROLES_LABELS } from '../../utils/constants';

export const IntegranteDetail = ({ integrante }) => {
  if (!integrante) return null;

  return (
    <div className="space-y-6">
      <Card title={integrante.nombre} description={integrante.filial_nombre}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="info">{ROLES_LABELS[integrante.rol] || integrante.rol}</Badge>
          <Badge variant={integrante.estado === 'ACTIVO' ? 'success' : 'warning'}>
            {integrante.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-700">Correo</dt>
            <dd className="text-sm text-slate-600">{integrante.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-700">Teléfono</dt>
            <dd className="text-sm text-slate-600">{integrante.telefono}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-700">Fecha de ingreso</dt>
            <dd className="text-sm text-slate-600">{formatDate(integrante.fecha_ingreso)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-700">Cargo</dt>
            <dd className="text-sm text-slate-600">{integrante.cargo}</dd>
          </div>
        </dl>
      </Card>
      {integrante.acciones && (
        <Card title="Acciones participadas">
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-600">
            {integrante.acciones.map((accion) => (
              <li key={accion.id}>{accion.nombre}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default IntegranteDetail;
