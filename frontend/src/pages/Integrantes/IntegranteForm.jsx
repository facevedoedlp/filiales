import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateIntegrante,
  useIntegrante,
  useUpdateIntegrante,
} from '../../hooks/useIntegrantes.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Select from '../../components/common/Select.jsx';
import { useFiliales } from '../../hooks/useFiliales.js';

const integranteSchema = z.object({
  nombre: z.string().min(3, 'El nombre es obligatorio'),
  dni: z.string().min(7, 'DNI inválido'),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  cargo: z.string().min(2, 'Ingresá un cargo'),
  esReferente: z.boolean().optional(),
  numeroSocio: z.string().optional().or(z.literal('')),
  filialId: z.union([z.string(), z.number()]),
});

const IntegranteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data, isLoading } = useIntegrante(id);
  const createIntegrante = useCreateIntegrante();
  const updateIntegrante = useUpdateIntegrante();
  const { data: filialesData } = useFiliales({ page: 1, limit: 200, esActiva: true });

  const filialesOptions = filialesData?.data?.items?.map((filial) => ({
    value: filial.id,
    label: filial.nombre,
  })) || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(integranteSchema),
    defaultValues: {
      nombre: '',
      dni: '',
      correo: '',
      telefono: '',
      cargo: '',
      esReferente: false,
      numeroSocio: '',
      filialId: filialesOptions[0]?.value || '',
    },
  });

  useEffect(() => {
    if (!isEditing && filialesOptions[0]) {
      setValue('filialId', filialesOptions[0].value);
    }
  }, [filialesOptions, isEditing, setValue]);

  useEffect(() => {
    if (data?.data) {
      const payload = data.data;
      const fields = [
        'nombre',
        'dni',
        'correo',
        'telefono',
        'cargo',
        'esReferente',
        'numeroSocio',
        'filialId',
      ];
      fields.forEach((field) => {
        if (field in payload) {
          setValue(field, payload[field] ?? '');
        }
      });
    }
  }, [data, setValue]);

  const onSubmit = async (values) => {
    if (isEditing) {
      await updateIntegrante.mutateAsync({ id, data: values });
    } else {
      await createIntegrante.mutateAsync(values);
    }
    navigate('/integrantes');
  };

  if (isEditing && isLoading) {
    return <Loading message="Cargando integrante" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">
        {isEditing ? 'Editar integrante' : 'Nuevo integrante'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Completa la información personal y de contacto del integrante.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
          <Input label="DNI" {...register('dni')} error={errors.dni?.message} />
          <Input label="Correo" {...register('correo')} error={errors.correo?.message} />
          <Input label="Teléfono" {...register('telefono')} error={errors.telefono?.message} />
          <Input label="Cargo" {...register('cargo')} error={errors.cargo?.message} />
          <Input label="Número de socio" {...register('numeroSocio')} error={errors.numeroSocio?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Filial"
            options={filialesOptions}
            value={filialesOptions.find((option) => String(option.value) === String(watch('filialId')))}
            onChange={(option) => setValue('filialId', option?.value ?? '')}
            error={errors.filialId?.message}
          />

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register('esReferente')} className="h-4 w-4 rounded border-slate-300" />
            ¿Es referente?
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting || createIntegrante.isPending || updateIntegrante.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || createIntegrante.isPending || updateIntegrante.isPending}>
            {isEditing ? 'Guardar cambios' : 'Crear integrante'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IntegranteForm;
