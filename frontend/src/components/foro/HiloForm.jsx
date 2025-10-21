import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { composeValidators, required } from '../../utils/validators';

export const HiloForm = ({ defaultValues, categoriasOptions = [], onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Título"
        placeholder="Tema del hilo"
        error={errors.titulo?.message}
        {...register('titulo', composeValidators(required()))}
      />
      <Select
        label="Categoría"
        options={categoriasOptions}
        error={errors.categoria?.message}
        {...register('categoria', composeValidators(required()))}
      />
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Descripción
        <textarea
          rows={6}
          className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 ${
            errors.descripcion ? 'border-red-500' : ''
          }`}
          {...register('descripcion', composeValidators(required()))}
        />
        {errors.descripcion && <span className="text-xs text-red-600">{errors.descripcion.message}</span>}
      </label>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Guardar hilo
        </Button>
      </div>
    </form>
  );
};

export default HiloForm;
