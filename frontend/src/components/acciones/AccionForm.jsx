import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, required } from '../../utils/validators';

const estadoOptions = [
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'FINALIZADA', label: 'Finalizada' },
];

export const AccionForm = ({ defaultValues, filialesOptions = [], onSubmit, isSubmitting }) => {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nombre de la acción"
          placeholder="Acción solidaria"
          error={errors.nombre?.message}
          {...register('nombre', composeValidators(required()))}
        />
        <Select
          label="Filial"
          options={filialesOptions}
          error={errors.filial?.message}
          {...register('filial', composeValidators(required()))}
        />
        <Input
          label="Fecha"
          type="date"
          error={errors.fecha?.message}
          {...register('fecha', composeValidators(required()))}
        />
        <Select
          label="Estado"
          options={estadoOptions}
          error={errors.estado?.message}
          {...register('estado', composeValidators(required()))}
        />
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Descripción
        <textarea
          rows={4}
          className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 ${
            errors.descripcion ? 'border-red-500' : ''
          }`}
          {...register('descripcion', composeValidators(required()))}
        />
        {errors.descripcion && <span className="text-xs text-red-600">{errors.descripcion.message}</span>}
      </label>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Guardar acción
        </Button>
      </div>
    </form>
  );
};

export default AccionForm;
