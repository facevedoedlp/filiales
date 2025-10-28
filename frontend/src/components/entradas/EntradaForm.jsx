import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, required } from '../../utils/validators';
import { ESTADOS_ENTRADA } from '../../utils/constants';

export const EntradaForm = ({ defaultValues, filialesOptions = [], onSubmit, isSubmitting, isAdmin }) => {
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
          label="Evento"
          placeholder="Partido vs ..."
          error={errors.evento?.message}
          {...register('evento', composeValidators(required()))}
        />
        <Input
          label="Fecha del evento"
          type="date"
          error={errors.fecha_evento?.message}
          {...register('fecha_evento', composeValidators(required()))}
        />
        <Input
          label="Cantidad de entradas"
          type="number"
          min={1}
          error={errors.cantidad?.message}
          {...register('cantidad', composeValidators(required()))}
        />
        {isAdmin && (
          <Select
            label="Estado"
            options={ESTADOS_ENTRADA}
            error={errors.estado?.message}
            {...register('estado', composeValidators(required()))}
          />
        )}
        {isAdmin && (
          <Select
            label="Filial"
            options={filialesOptions}
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
