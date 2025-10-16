import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { FORO_CATEGORIAS } from '../../utils/constants.js';

const schema = z.object({
  titulo: z.string().min(3),
  contenido: z.string().min(10),
  categoria: z.enum(FORO_CATEGORIAS),
});

const ForoTemaForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // TODO: integrar con API
    navigate('/foro');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Nuevo tema</h2>
        <p className="text-sm text-slate-500">Comparte novedades con la comunidad</p>
      </div>
      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Título" {...register('titulo')} />
        <label className="block text-sm font-medium text-slate-700">
          <span>Categoría</span>
          <select
            className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
            {...register('categoria')}
          >
            {FORO_CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          <span>Contenido</span>
          <textarea
            rows={6}
            className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
            {...register('contenido')}
          />
        </label>
        <Button type="submit" disabled={isSubmitting}>
          Publicar
        </Button>
      </form>
    </section>
  );
};

export default ForoTemaForm;
