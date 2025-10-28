import { useNavigate } from 'react-router-dom';
import EntradaForm from '../../components/entradas/EntradaForm';
import { useEntradas } from '../../hooks/useEntradas';
import { useFiliales } from '../../hooks/useFiliales';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const EntradaNew = () => {
  const navigate = useNavigate();
  const { createEntrada } = useEntradas();
  const { filiales } = useFiliales();
  const { user } = useAuth();

  const handleSubmit = (data) => {
    createEntrada(data, {
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
        filialesOptions={filiales?.map((f) => ({ value: f.id, label: f.nombre }))}
        onSubmit={handleSubmit}
        isAdmin={user?.rol === ROLES.ADMIN}
        defaultValues={{ filial: user?.filial_id, estado: 'PENDIENTE' }}
      />
    </div>
  );
};

export default EntradaNew;
