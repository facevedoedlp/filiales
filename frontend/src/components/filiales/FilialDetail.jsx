import { Card } from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const FilialDetail = ({ filial, integrantes = [], acciones = [] }) => {
  if (!filial) return null;

  return (
    <div className="space-y-6">
      <Card
        title={filial.nombre}
        description={`${filial.direccion || 'Sin direccion'} - ${filial.ciudad}`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Informacion general</h4>
            <dl className="mt-2 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-700">Codigo</dt>
                <dd>{filial.codigo}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Estado</dt>
                <dd>
                  <Badge variant={filial.activa ? 'success' : 'warning'}>
                    {filial.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Fecha de creacion</dt>
                <dd>{formatDate(filial.created_at)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contacto</h4>
            <dl className="mt-2 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-700">Correo</dt>
                <dd>{filial.contacto_email || 'Sin email'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Telefono</dt>
                <dd>{filial.contacto_telefono || 'Sin telefono'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <Card title="Integrantes" description="Integrantes activos de la filial">
        <div className="space-y-3">
          {integrantes.length ? (
            integrantes.map((integrante) => (
              <div
                key={integrante.id}
                className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{integrante.persona_nombre}</p>
                  <p className="text-xs text-slate-500">{integrante.cargo}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sin integrantes registrados.</p>
          )}
        </div>
      </Card>

      <Card title="Acciones" description="Ultimas acciones de la filial">
        <div className="space-y-3">
          {acciones.length ? (
            acciones.map((accion) => (
              <div
                key={accion.id}
                className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{accion.nombre}</p>
                  <p className="text-xs text-slate-500">{formatDate(accion.fecha)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sin acciones registradas.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FilialDetail;
