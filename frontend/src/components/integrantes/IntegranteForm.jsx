import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, email as emailValidator, required } from '../../utils/validators';
import { ROLES, ROLES_LABELS } from '../../utils/constants';

const roleOptions = Object.values(ROLES).map((role) => ({ value: role, label: ROLES_LABELS[role] }));

export const IntegranteForm = ({ defaultValues, filialesOptions = [], onSubmit, isSubmitting }) => {
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
          label="Nombre completo"
          placeholder="Nombre y apellido"
          error={errors.nombre?.message}
          {...register('nombre', composeValidators(required()))}
        />
        <Input
          label="Correo electrónico"
          placeholder="usuario@estudiantes.com"
          error={errors.email?.message}
          {...register('email', composeValidators(required(), emailValidator()))}
        />
        <Select
          label="Rol"
          options={roleOptions}
          error={errors.rol?.message}
          {...register('rol', composeValidators(required()))}
        />
        <Select
          label="Filial"
          options={filialesOptions}
          error={errors.filial?.message}
          {...register('filial', composeValidators(required()))}
        />
        <Input label="Teléfono" placeholder="011-0000-0000" {...register('telefono')} />
        <Input label="Cargo" placeholder="Cargo interno" {...register('cargo')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default IntegranteForm;
