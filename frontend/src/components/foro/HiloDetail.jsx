import { Button } from '../common/Button';
import Badge from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { RespuestaItem } from './RespuestaItem';

export const HiloDetail = ({ hilo, onToggle, onNuevaRespuesta, children }) => {
  if (!hilo) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{hilo.titulo}</h2>
            <p className="mt-2 text-sm text-slate-600">{hilo.descripcion}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Por {hilo.autor_nombre}</span>
              <span>{formatDateTime(hilo.creado)}</span>
              {hilo.esta_cerrado && <Badge variant="warning">Cerrado</Badge>}
              {hilo.esta_fijado && <Badge variant="info">Fijado</Badge>}
            </div>
          </div>
          {onToggle && (
            <Button variant="secondary" size="sm" onClick={() => onToggle(hilo)}>
              {hilo.esta_cerrado ? 'Abrir hilo' : 'Cerrar hilo'}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Respuestas</h3>
        {hilo.respuestas?.length ? (
          <div className="space-y-4">
            {hilo.respuestas.map((respuesta) => (
              <RespuestaItem key={respuesta.id} respuesta={respuesta} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sé el primero en responder.</p>
        )}
      </div>

      {!hilo.esta_cerrado && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900">Nueva respuesta</h4>
          {children || (
            <Button className="mt-4" onClick={onNuevaRespuesta}>
              Responder
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HiloDetail;
