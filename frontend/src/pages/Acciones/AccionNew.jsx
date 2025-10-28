import { useNavigate } from 'react-router-dom';
import { useAcciones } from '../../hooks/useAcciones';
import { useFiliales } from '../../hooks/useFiliales';
import AccionForm from '../../components/acciones/AccionForm';

const AccionNew = () => {
  const navigate = useNavigate();
  const { createAccion } = useAcciones();
  const { filiales } = useFiliales();

  const handleSubmit = (data) => {
    createAccion(data, {
      onSuccess: (accion) => {
        navigate(`/acciones/${accion.id}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nueva acción</h1>
        <p className="text-sm text-slate-500">Registra una nueva acción solidaria para tu filial.</p>
      </div>
      <AccionForm filialesOptions={filiales?.map((f) => ({ value: f.id, label: f.nombre }))} onSubmit={handleSubmit} />
    </div>
  );
};

export default AccionNew;
