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
          onAprobar={(entrada) => aprobarEntrada({ id: entrada.id, data: {} })}
          onRechazar={(entrada) => rechazarEntrada({ id: entrada.id, data: {} })}
        />
      )}
    </div>
  );
};

export default EntradasApproval;
