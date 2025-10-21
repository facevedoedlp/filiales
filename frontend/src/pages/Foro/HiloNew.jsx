import { useNavigate } from 'react-router-dom';
import HiloForm from '../../components/foro/HiloForm';
import { useCategorias, useHilos } from '../../hooks/useForo';

const HiloNew = () => {
  const navigate = useNavigate();
  const { categorias } = useCategorias();
  const { createHilo } = useHilos();

  const handleSubmit = (data) => {
    createHilo(data, {
      onSuccess: (hilo) => navigate(`/foro/hilo/${hilo.id}`),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo hilo</h1>
        <p className="text-sm text-slate-500">Inicia una nueva conversación en el foro.</p>
      </div>
      <HiloForm
        categoriasOptions={categorias?.map((categoria) => ({ value: categoria.slug, label: categoria.nombre }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default HiloNew;
