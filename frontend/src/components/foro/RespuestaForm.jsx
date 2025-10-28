import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { composeValidators, required } from '../../utils/validators';

export const RespuestaForm = ({ onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contenido: '',
    },
  });

  const submitHandler = (data) => {
    onSubmit?.(data, { reset });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
      <textarea
        rows={4}
        className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 ${
          errors.contenido ? 'border-red-500' : ''
        }`}
        placeholder="Escribe tu respuesta"
        {...register('contenido', composeValidators(required()))}
      />
      {errors.contenido && <span className="text-xs text-red-600">{errors.contenido.message}</span>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          Publicar respuesta
        </Button>
      </div>
    </form>
  );
};

export default RespuestaForm;
