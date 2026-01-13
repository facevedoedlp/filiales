import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, required } from '../../utils/validators';

export const EntradaForm = ({
  defaultValues,
  partidosOptions = [],
  filialesOptions = [],
  onSubmit,
  isSubmitting,
  isAdmin,
}) => {
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
        <Select
          label="Partido"
          options={[{ value: '', label: 'Seleccione un partido' }, ...partidosOptions]}
          error={errors.partido?.message}
          {...register('partido', composeValidators(required()))}
        />
        <Input
          label="Cantidad de entradas"
          type="number"
          min={1}
          error={errors.cantidad_solicitada?.message}
          {...register('cantidad_solicitada', composeValidators(required()))}
        />
        {isAdmin && (
          <Select
            label="Filial"
            options={[{ value: '', label: 'Seleccione una filial' }, ...filialesOptions]}
            error={errors.filial?.message}
            {...register('filial', composeValidators(required()))}
          />
        )}
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Motivo
        <textarea
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          {...register('motivo')}
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Guardar solicitud
        </Button>
      </div>
    </form>
  );
};

export default EntradaForm;
