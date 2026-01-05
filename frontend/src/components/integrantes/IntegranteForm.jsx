import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import { composeValidators, email as emailValidator, required } from '../../utils/validators';
import { ROLES, ROLES_LABELS } from '../../utils/constants';

const roleOptions = Object.values(ROLES).map((role) => ({ value: role, label: ROLES_LABELS[role] }));

export const IntegranteForm = ({ defaultValues, filialesOptions = [], onSubmit, isSubmitting, isAdmin = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      es_socio: false,
      numero_socio: '',
      ...defaultValues,
    },
  });

  const esSocio = watch('es_socio');

  useEffect(() => {
    reset({
      es_socio: false,
      numero_socio: '',
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nombre completo"
          placeholder="Nombre y apellido"
          error={errors.persona_nombre?.message || errors.nombre?.message}
          {...register('persona_nombre', composeValidators(required()))}
        />
        <Input
          label="Correo electrónico"
          placeholder="usuario@estudiantes.com"
          error={errors.email?.message}
          {...register('email', composeValidators(required(), emailValidator()))}
        />
        <Select
          label="Cargo"
          options={[
            { value: 'PRESIDENTE', label: 'Presidente' },
            { value: 'SECRETARIO', label: 'Secretario' },
            { value: 'TESORERO', label: 'Tesorero' },
            { value: 'VOCAL', label: 'Vocal' },
            { value: 'OTRO', label: 'Otro' },
          ]}
          error={errors.cargo?.message}
          {...register('cargo', composeValidators(required()))}
        />
        <Select
          label="Filial"
          options={[{ value: '', label: 'Seleccione una filial' }, ...filialesOptions]}
          error={errors.filial?.message}
          {...register('filial', isAdmin ? {} : composeValidators(required()))}
        />
        <Input label="Teléfono" placeholder="011-0000-0000" {...register('telefono')} />
        <Input label="Documento" placeholder="12345678" {...register('persona_documento', composeValidators(required()))} />
        <Input label="Fecha desde" type="date" error={errors.desde?.message} {...register('desde', composeValidators(required()))} />
        <Input label="Fecha hasta" type="date" {...register('hasta')} />
      </div>
      <div className="border-t border-slate-200 pt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-[#c41230] focus:ring-[#c41230]"
              {...register('es_socio')}
            />
            <span className="text-sm font-medium text-slate-700">Es socio del club</span>
          </label>
          {esSocio && (
            <Input
              label="Número de socio"
              placeholder="Número de socio"
              error={errors.numero_socio?.message}
              {...register('numero_socio', composeValidators(required()))}
            />
          )}
        </div>
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
