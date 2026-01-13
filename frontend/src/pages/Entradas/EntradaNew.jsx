import { useNavigate } from 'react-router-dom';
import EntradaForm from '../../components/entradas/EntradaForm';
import { useEntradas } from '../../hooks/useEntradas';
import { usePartidos } from '../../hooks/usePartidos';
import { useFiliales } from '../../hooks/useFiliales';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const EntradaNew = () => {
  const navigate = useNavigate();
  const { createEntrada } = useEntradas();
  const { user } = useAuth();
  const { partidos } = usePartidos({
    page_size: 200,
    ...(user?.rol === ROLES.ADMIN ? {} : { habilitado: true }),
  });
  const { filiales } = useFiliales({ page_size: 200 });

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      partido: data.partido ? Number(data.partido) : null,
      cantidad_solicitada: Number(data.cantidad_solicitada),
      filial: data.filial ? Number(data.filial) : undefined,
    };
    createEntrada(payload, {
      onSuccess: (entrada) => {
        navigate(`/entradas/${entrada.id}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nueva solicitud</h1>
        <p className="text-sm text-slate-500">Solicita entradas para un evento.</p>
      </div>
      <EntradaForm
        partidosOptions={partidos?.map((p) => ({ value: p.id, label: p.titulo }))}
        filialesOptions={filiales?.map((f) => ({ value: f.id, label: f.nombre }))}
        onSubmit={handleSubmit}
        isAdmin={user?.rol === ROLES.ADMIN}
        defaultValues={{
          partido: '',
          cantidad_solicitada: 1,
          motivo: '',
          filial: user?.filialId || '',
        }}
      />
    </div>
  );
};

export default EntradaNew;
