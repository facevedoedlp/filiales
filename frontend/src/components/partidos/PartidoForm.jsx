import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, required } from '../../utils/validators';

const estadoOptions = [
  { value: 'PROGRAMADO', label: 'Programado' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export const PartidoForm = ({ defaultValues, onSubmit, isSubmitting }) => {
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
          label="Titulo"
          placeholder="Estudiantes vs ..."
          error={errors.titulo?.message}
          {...register('titulo', composeValidators(required()))}
        />
        <Input
          label="Fecha y hora"
          type="datetime-local"
          error={errors.fecha?.message}
          {...register('fecha', composeValidators(required()))}
        />
        <Input
          label="Lugar"
          placeholder="Estadio ..."
          error={errors.lugar?.message}
          {...register('lugar', composeValidators(required()))}
        />
        <Select
          label="Estado"
          options={estadoOptions}
          error={errors.estado?.message}
          {...register('estado', composeValidators(required()))}
        />
        <Input
          label="Cupo total"
          type="number"
          min={0}
          error={errors.cupo_total?.message}
          {...register('cupo_total')}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" {...register('habilitado')} />
          Habilitado para solicitudes
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" {...register('solo_socios')} />
          Solo socios
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Descripcion
        <textarea
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          {...register('descripcion')}
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default PartidoForm;
