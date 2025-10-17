import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateFilial,
  useFilial,
  useUpdateFilial,
} from '../../hooks/useFiliales.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import TextArea from '../../components/common/TextArea.jsx';

const filialSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  paisId: z.union([z.string(), z.number()]).optional(),
  provinciaId: z.union([z.string(), z.number()]).optional(),
  localidadId: z.union([z.string(), z.number()]).optional(),
  nombreLocalidad: z.string().optional(),
  mailInstitucional: z.string().email('Correo inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaFundacion: z.string().optional(),
  autoridades: z.string().optional(),
});

const FilialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data, isLoading } = useFilial(id);
  const createFilial = useCreateFilial();
  const updateFilial = useUpdateFilial();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(filialSchema),
    defaultValues: {
      nombre: '',
      paisId: '',
      provinciaId: '',
      localidadId: '',
      nombreLocalidad: '',
      mailInstitucional: '',
      telefono: '',
      direccion: '',
      fechaFundacion: '',
      autoridades: '',
    },
  });

  useEffect(() => {
    if (data?.data) {
      const payload = data.data;
      const fields = [
        'nombre',
        'paisId',
        'provinciaId',
        'localidadId',
        'nombreLocalidad',
        'mailInstitucional',
        'telefono',
        'direccion',
        'fechaFundacion',
        'autoridades',
      ];
      fields.forEach((field) => {
        if (field in payload) {
          setValue(field, payload[field] ?? '');
        }
      });
    }
  }, [data, setValue]);

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateFilial.mutateAsync({ id, data: values });
      } else {
        await createFilial.mutateAsync(values);
      }
      navigate('/filiales');
    } catch (error) {
      console.error(error);
    }
  };

  if (isEditing && isLoading) {
    return <Loading message="Cargando filial" />;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">
        {isEditing ? 'Editar filial' : 'Crear nueva filial'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Completá los datos para {isEditing ? 'actualizar la información de la filial' : 'registrar una nueva filial en el sistema'}.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
          <Input label="Mail institucional" {...register('mailInstitucional')} error={errors.mailInstitucional?.message} />
          <Input label="Teléfono" {...register('telefono')} error={errors.telefono?.message} />
          <Input label="Dirección" {...register('direccion')} error={errors.direccion?.message} />
          <Input label="Provincia ID" {...register('provinciaId')} error={errors.provinciaId?.message} />
          <Input label="Localidad" {...register('nombreLocalidad')} error={errors.nombreLocalidad?.message} />
          <Input
            type="date"
            label="Fecha de fundación"
            {...register('fechaFundacion')}
            error={errors.fechaFundacion?.message}
          />
        </div>

        <TextArea
          label="Autoridades"
          rows={4}
          {...register('autoridades')}
          error={errors.autoridades?.message}
          maxLength={500}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting || createFilial.isPending || updateFilial.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createFilial.isPending || updateFilial.isPending}
          >
            {isEditing ? 'Guardar cambios' : 'Crear filial'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FilialForm;
