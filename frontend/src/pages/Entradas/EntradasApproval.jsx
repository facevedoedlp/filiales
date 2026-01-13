import Spinner from '../../components/common/Spinner';
import { EntradaApproval } from '../../components/entradas/EntradaApproval';
import { useEntradas } from '../../hooks/useEntradas';

const EntradasApproval = () => {
  const { entradas, isLoading, aprobarEntrada, rechazarEntrada } = useEntradas({ estado: 'PENDIENTE' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Aprobación de solicitudes</h1>
        <p className="text-sm text-slate-500">Aprueba o rechaza las solicitudes pendientes.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <EntradaApproval
          entradas={entradas}
          onAprobar={(entrada) => {
            const value = window.prompt('Cantidad a asignar', entrada.cantidad_solicitada || '');
            if (!value) return;
            const cantidad = Number(value);
            if (!Number.isFinite(cantidad) || cantidad <= 0) return;
            return aprobarEntrada({ id: entrada.id, data: { cantidad_asignada: cantidad } });
          }}
          onRechazar={(entrada) => {
            const motivo = window.prompt('Motivo del rechazo (opcional)', '');
            return rechazarEntrada({ id: entrada.id, data: { motivo: motivo || '' } });
          }}
        />
      )}
    </div>
  );
};

export default EntradasApproval;
