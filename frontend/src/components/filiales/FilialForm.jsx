import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, required } from '../../utils/validators';

const tipoOptions = [
  { value: 'CLUB', label: 'Club' },
  { value: 'AGRUPACION', label: 'Agrupación' },
  { value: 'REGIONAL', label: 'Regional' },
];

export const FilialForm = ({ defaultValues, onSubmit, isSubmitting }) => {
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
          label="Nombre"
          placeholder="Filial ..."
          error={errors.nombre?.message}
          {...register('nombre', composeValidators(required()))}
        />
        <Input
          label="Ciudad"
          placeholder="Ciudad"
          error={errors.ciudad?.message}
          {...register('ciudad', composeValidators(required()))}
        />
        <Input
          label="Dirección"
          placeholder="Dirección completa"
          error={errors.direccion?.message}
          {...register('direccion', composeValidators(required()))}
        />
        <Select
          label="Tipo"
          options={tipoOptions}
          error={errors.tipo?.message}
          {...register('tipo', composeValidators(required()))}
        />
        <Input label="Latitud" type="number" step="any" {...register('latitud')} />
        <Input label="Longitud" type="number" step="any" {...register('longitud')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default FilialForm;
