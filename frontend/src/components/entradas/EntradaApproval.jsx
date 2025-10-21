import { Button } from '../common/Button';
import { EntradaCard } from './EntradaCard';

export const EntradaApproval = ({ entradas, onAprobar, onRechazar }) => {
  if (!entradas?.length) {
    return <p className="text-sm text-slate-500">No hay solicitudes pendientes.</p>;
  }

  return (
    <div className="grid gap-4">
      {entradas.map((entrada) => (
        <EntradaCard
          key={entrada.id}
          entrada={entrada}
          actions={
            entrada.estado === 'PENDIENTE' && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onAprobar?.(entrada)}>
                  Aprobar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onRechazar?.(entrada)}>
                  Rechazar
                </Button>
              </div>
            )
          }
        />
      ))}
    </div>
  );
};

export default EntradaApproval;
