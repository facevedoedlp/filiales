import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAccion,
  useCreateAccion,
  useUpdateAccion,
} from '../../hooks/useAcciones.js';
import { useFiliales } from '../../hooks/useFiliales.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import TextArea from '../../components/common/TextArea.jsx';
import Loading from '../../components/common/Loading.jsx';

const accionSchema = z.object({
  titulo: z.string().min(3, 'Ingresá un título'),
  descripcion: z.string().min(10, 'Describí la acción'),
  tipo: z.enum(['Filial', 'Captación'], {
    errorMap: () => ({ message: 'Seleccioná un tipo' }),
  }),
  fecha: z.string().min(1, 'Seleccioná una fecha'),
  ubicacion: z.string().optional().or(z.literal('')),
  enviarComunicacion: z.boolean().optional(),
  filialId: z.union([z.string(), z.number()]),
  imagenes: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length <= 3,
      'Podés subir hasta 3 imágenes'
    ),
});

const AccionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data, isLoading } = useAccion(id);
  const createAccion = useCreateAccion();
  const updateAccion = useUpdateAccion();
  const { data: filialesData } = useFiliales({ page: 1, limit: 200, esActiva: true });
  const [imagenesPreview, setImagenesPreview] = useState([]);

  const filialesOptions = filialesData?.data?.items?.map((filial) => ({
    value: filial.id,
    label: filial.nombre,
  })) || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accionSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      tipo: 'Filial',
      fecha: '',
      ubicacion: '',
      enviarComunicacion: false,
      filialId: filialesOptions[0]?.value || '',
      imagenes: [],
    },
  });

  const imagenes = watch('imagenes');

  useEffect(() => {
    if (!isEditing && filialesOptions[0]) {
      setValue('filialId', filialesOptions[0].value);
    }
  }, [filialesOptions, isEditing, setValue]);

  useEffect(() => {
    if (isEditing && data?.data) {
      const payload = data.data;
      reset({
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        tipo: payload.tipo,
        fecha: payload.fecha ? payload.fecha.slice(0, 10) : '',
        ubicacion: payload.ubicacion || '',
        enviarComunicacion: Boolean(payload.enviarComunicacion),
        filialId: payload.filialId,
        imagenes: [],
      });
      setImagenesPreview(payload.imagenes?.map((imagen) => imagen.url) || []);
    }
  }, [isEditing, data, reset]);

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append('titulo', values.titulo);
    formData.append('descripcion', values.descripcion);
    formData.append('tipo', values.tipo);
    formData.append('fecha', values.fecha);
    formData.append('filialId', values.filialId);
    if (values.ubicacion) formData.append('ubicacion', values.ubicacion);
    formData.append('enviarComunicacion', values.enviarComunicacion ? 'true' : 'false');

    if (imagenes?.length) {
      Array.from(imagenes).forEach((file) => formData.append('imagenes', file));
    }

    if (isEditing) {
      await updateAccion.mutateAsync({ id, data: formData });
    } else {
      await createAccion.mutateAsync(formData);
    }
    navigate('/acciones');
  };

  if (isEditing && isLoading) {
    return <Loading message="Cargando acción" />;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">
        {isEditing ? 'Editar acción' : 'Registrar nueva acción'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">Detallá la actividad realizada por la filial.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <Input label="Título" {...register('titulo')} error={errors.titulo?.message} />

        <TextArea
          label="Descripción"
          rows={5}
          {...register('descripcion')}
          error={errors.descripcion?.message}
          maxLength={1000}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Tipo"
            options={[
              { value: 'Filial', label: 'Filial' },
              { value: 'Captación', label: 'Captación' },
            ]}
            value={{ value: watch('tipo'), label: watch('tipo') }}
            onChange={(option) => setValue('tipo', option.value)}
            error={errors.tipo?.message}
          />

          <Select
            label="Filial"
            options={filialesOptions}
            value={filialesOptions.find((option) => String(option.value) === String(watch('filialId')))}
            onChange={(option) => setValue('filialId', option?.value ?? '')}
            error={errors.filialId?.message}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input type="date" label="Fecha" {...register('fecha')} error={errors.fecha?.message} />
          <Input label="Ubicación" {...register('ubicacion')} error={errors.ubicacion?.message} />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register('enviarComunicacion')} className="h-4 w-4 rounded border-slate-300" />
            Enviar a Comunicación
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Imágenes (máx. 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-1 block w-full text-sm text-slate-600"
            onChange={(event) => {
              const files = event.target.files;
              setValue('imagenes', files);
              setImagenesPreview(Array.from(files || []).map((file) => URL.createObjectURL(file)));
            }}
          />
          {errors.imagenes ? (
            <span className="mt-1 block text-xs text-red-600">{errors.imagenes.message}</span>
          ) : null}

          {imagenesPreview.length ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {imagenesPreview.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt="Previsualización"
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting || createAccion.isPending || updateAccion.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || createAccion.isPending || updateAccion.isPending}>
            {isEditing ? 'Guardar cambios' : 'Registrar acción'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AccionForm;
