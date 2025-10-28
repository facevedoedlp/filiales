import { formatDateTime } from '../../utils/formatters';

export const RespuestaItem = ({ respuesta }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{respuesta.autor_nombre}</span>
        <span>{formatDateTime(respuesta.creado)}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{respuesta.contenido}</p>
    </div>
  );
};

export default RespuestaItem;
