import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const FilialDetail = ({ filial }) => {
  if (!filial) return null;

  return (
    <div className="space-y-6">
      <Card
        title={filial.nombre}
        description={`${filial.direccion} - ${filial.ciudad}`}
        actions={
          <Link
            to={`/filiales/${filial.id}/editar`}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Editar
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Información general</h4>
            <dl className="mt-2 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-700">Tipo</dt>
                <dd>{filial.tipo}</dd>
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
                <dt className="font-semibold text-slate-700">Fecha de creación</dt>
                <dd>{formatDate(filial.fecha_creacion)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contacto</h4>
            <dl className="mt-2 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-700">Correo</dt>
                <dd>{filial.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Teléfono</dt>
                <dd>{filial.telefono}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <Card title="Integrantes" description="Integrantes activos de la filial">
        <div className="space-y-3">
          {filial.integrantes?.length ? (
            filial.integrantes.map((integrante) => (
              <div key={integrante.id} className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{integrante.nombre}</p>
                  <p className="text-xs text-slate-500">{integrante.rol}</p>
                </div>
                <Link
                  to={`/integrantes/${integrante.id}`}
                  className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Ver perfil
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sin integrantes registrados.</p>
          )}
        </div>
      </Card>

      <Card title="Acciones" description="Últimas acciones de la filial">
        <div className="space-y-3">
          {filial.acciones?.length ? (
            filial.acciones.map((accion) => (
              <div key={accion.id} className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{accion.nombre}</p>
                  <p className="text-xs text-slate-500">{formatDate(accion.fecha)}</p>
                </div>
                <Link
                  to={`/acciones/${accion.id}`}
                  className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Ver detalle
                </Link>
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
