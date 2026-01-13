import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { composeValidators, required } from '../../utils/validators';

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
          label="Codigo"
          placeholder="ZUBELDIA"
          error={errors.codigo?.message}
          {...register('codigo', composeValidators(required()))}
        />
        <Input
          label="Ciudad"
          placeholder="Ciudad"
          error={errors.ciudad?.message}
          {...register('ciudad', composeValidators(required()))}
        />
        <Input
          label="Provincia"
          placeholder="Provincia"
          error={errors.provincia?.message}
          {...register('provincia', composeValidators(required()))}
        />
        <Input
          label="Pais"
          placeholder="Argentina"
          error={errors.pais?.message}
          {...register('pais', composeValidators(required()))}
        />
        <Input
          label="Direccion"
          placeholder="Direccion completa"
          error={errors.direccion?.message}
          {...register('direccion')}
        />
        <Input
          label="Email de contacto"
          placeholder="contacto@filial.com"
          error={errors.contacto_email?.message}
          {...register('contacto_email')}
        />
        <Input
          label="Telefono de contacto"
          placeholder="+54 9 221 ..."
          error={errors.contacto_telefono?.message}
          {...register('contacto_telefono')}
        />
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
