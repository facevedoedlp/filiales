import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateFilial,
  useFilial,
  useUpdateFilial,
} from '../../hooks/useFiliales.js';
import { geografiaService } from '../../services/geografia.service.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import SelectSearch from '../../components/common/SelectSearch.jsx';

const filialSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  provincia: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((value) => value !== null, 'La provincia es requerida'),
  localidad: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  mailInstitucional: z
    .string()
    .email('Correo inválido')
    .optional()
    .or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaFundacion: z.string().optional(),
});

const FilialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data, isLoading } = useFilial(id);
  const createFilial = useCreateFilial();
  const updateFilial = useUpdateFilial();

  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(filialSchema),
    defaultValues: {
      nombre: '',
      provincia: null,
      localidad: null,
      mailInstitucional: '',
      telefono: '',
      direccion: '',
      fechaFundacion: '',
    },
  });

  const provinciaSeleccionada = watch('provincia');

  useEffect(() => {
    const cargarProvincias = async () => {
      setLoadingProvincias(true);
      try {
        const dataProvincias = await geografiaService.getProvincias();
        setProvincias(dataProvincias);
      } catch (error) {
        console.error('Error cargando provincias:', error);
      } finally {
        setLoadingProvincias(false);
      }
    };
    cargarProvincias();
  }, []);

  useEffect(() => {
    const cargarLocalidades = async () => {
      if (provinciaSeleccionada?.value) {
        setLoadingLocalidades(true);
        setValue('localidad', null);
        try {
          const dataLocalidades = await geografiaService.getLocalidades(
            provinciaSeleccionada.value,
          );
          setLocalidades(dataLocalidades);
        } catch (error) {
          console.error('Error cargando localidades:', error);
          setLocalidades([]);
        } finally {
          setLoadingLocalidades(false);
        }
      } else {
        setLocalidades([]);
      }
    };
    cargarLocalidades();
  }, [provinciaSeleccionada, setValue]);

  useEffect(() => {
    if (data?.data && provincias.length > 0) {
      const payload = data.data;

      setValue('nombre', payload.nombre ?? '');
      setValue('mailInstitucional', payload.mailInstitucional ?? '');
      setValue('telefono', payload.telefono ?? '');
      setValue('direccion', payload.direccionSede ?? payload.direccion ?? '');

      if (payload.fechaFundacion) {
        const fecha = new Date(payload.fechaFundacion);
        const fechaFormateada = fecha.toISOString().split('T')[0];
        setValue('fechaFundacion', fechaFormateada);
      }

      if (payload.provinciaId) {
        const provincia = provincias.find(
          (item) => item.value === payload.provinciaId.toString(),
        );
        if (provincia) {
          setValue('provincia', provincia);
        }
      }

      if (payload.localidadId && payload.nombreLocalidad) {
        setTimeout(() => {
          setValue('localidad', {
            value: payload.localidadId.toString(),
            label: payload.nombreLocalidad,
          });
        }, 500);
      }
    }
  }, [data, provincias, setValue]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        nombre: values.nombre,
        provinciaId: values.provincia?.value || null,
        localidadId: values.localidad?.value || null,
        nombreLocalidad: values.localidad?.label || null,
        mailInstitucional: values.mailInstitucional || null,
        telefono: values.telefono || null,
        direccion: values.direccion || null,
        fechaFundacion: values.fechaFundacion || null,
        paisId: 1,
      };

      if (isEditing) {
        await updateFilial.mutateAsync({ id, data: payload });
      } else {
        await createFilial.mutateAsync(payload);
      }

      navigate('/filiales');
    } catch (error) {
      console.error('Error guardando filial:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error al guardar la filial: ' + errorMessage);
    }
  };

  if (isEditing && isLoading) {
    return <Loading message="Cargando información de la filial..." />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEditing ? 'Editar filial' : 'Crear nueva filial'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isEditing
            ? 'Actualiza la información de la filial.'
            : 'Completa los datos para registrar una nueva filial en el sistema.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nombre de la filial"
              placeholder="Ej: Filial La Plata"
              {...register('nombre')}
              error={errors.nombre?.message}
              required
            />
          </div>

          <Controller
            name="provincia"
            control={control}
            render={({ field }) => (
              <SelectSearch
                label="Provincia"
                value={field.value}
                onChange={field.onChange}
                options={provincias}
                isLoading={loadingProvincias}
                placeholder="Seleccione una provincia"
                error={errors.provincia?.message}
                required
              />
            )}
          />

          <Controller
            name="localidad"
            control={control}
            render={({ field }) => (
              <SelectSearch
                label="Localidad"
                value={field.value}
                onChange={field.onChange}
                options={localidades}
                isLoading={loadingLocalidades}
                disabled={!provinciaSeleccionada}
                placeholder={
                  !provinciaSeleccionada
                    ? 'Primero seleccione una provincia'
                    : loadingLocalidades
                    ? 'Cargando localidades...'
                    : 'Seleccione una localidad'
                }
                error={errors.localidad?.message}
              />
            )}
          />

          <Input
            label="Dirección de la sede"
            placeholder="Ej: Calle 50 N° 123"
            {...register('direccion')}
            error={errors.direccion?.message}
          />

          <Input
            label="Teléfono"
            type="tel"
            placeholder="Ej: 221 123-4567"
            {...register('telefono')}
            error={errors.telefono?.message}
          />

          <Input
            label="Mail institucional"
            type="email"
            placeholder="contacto@filial.com"
            {...register('mailInstitucional')}
            error={errors.mailInstitucional?.message}
          />

          <Input
            type="date"
            label="Fecha de fundación"
            {...register('fechaFundacion')}
            error={errors.fechaFundacion?.message}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/filiales')}
            disabled={isSubmitting || createFilial.isPending || updateFilial.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createFilial.isPending || updateFilial.isPending}
          >
            {isSubmitting || createFilial.isPending || updateFilial.isPending
              ? 'Guardando...'
              : isEditing
              ? 'Guardar cambios'
              : 'Crear filial'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FilialForm;
