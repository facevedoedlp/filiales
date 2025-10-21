import Card from '../common/Card';
import { formatNumber } from '../../utils/formatters';

export const ResumenGeneral = ({ resumen }) => {
  if (!resumen) return null;

  return (
    <Card title="Resumen ejecutivo">
      <ul className="space-y-2 text-sm text-slate-600">
        <li>
          <span className="font-semibold">Filiales activas:</span> {formatNumber(resumen.filiales_activas)}
        </li>
        <li>
          <span className="font-semibold">Integrantes:</span> {formatNumber(resumen.integrantes_totales)}
        </li>
        <li>
          <span className="font-semibold">Acciones en curso:</span> {formatNumber(resumen.acciones_en_curso)}
        </li>
        <li>
          <span className="font-semibold">Entradas pendientes:</span> {formatNumber(resumen.entradas_pendientes)}
        </li>
        {resumen.destacados?.length > 0 && (
          <li>
            <span className="font-semibold">Destacados:</span>
            <ul className="ml-6 list-disc">
              {resumen.destacados.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </Card>
  );
};

export default ResumenGeneral;
