import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useActualizarTema,
  useCategoriasForo,
  useCrearTema,
  useTema,
} from '../../hooks/useForo.js';
import Input from '../../components/common/Input.jsx';
import TextArea from '../../components/common/TextArea.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';

const temaSchema = z.object({
  titulo: z.string().min(5, 'Ingresá un título descriptivo').max(200, 'Máximo 200 caracteres'),
  contenido: z.string().min(20, 'El contenido es obligatorio'),
  categoria: z.string().min(1, 'Seleccioná una categoría'),
  etiquetas: z.array(z.string()).optional(),
});

const ForoTemaForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { data: categoriasData } = useCategoriasForo();
  const { data, isLoading } = useTema(id);
  const crearTema = useCrearTema();
  const actualizarTema = useActualizarTema();
  const [tagInput, setTagInput] = useState('');

  const categoriasOptions = categoriasData?.data?.map((categoria) => ({
    value: categoria.codigo,
    label: categoria.nombre,
  })) || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(temaSchema),
    defaultValues: {
      titulo: '',
      contenido: '',
      categoria: categoriasOptions[0]?.value || '',
      etiquetas: [],
    },
  });

  const etiquetas = watch('etiquetas') || [];

  useEffect(() => {
    if (!isEditing && categoriasOptions[0]) {
      setValue('categoria', categoriasOptions[0].value);
    }
  }, [categoriasOptions, isEditing, setValue]);

  useEffect(() => {
    if (data?.data && isEditing) {
      setValue('titulo', data.data.titulo);
      setValue('contenido', data.data.contenido);
      setValue('categoria', data.data.categoria);
      setValue('etiquetas', data.data.etiquetas || []);
    }
  }, [data, isEditing, setValue]);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (etiquetas.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }
    setValue('etiquetas', [...etiquetas, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setValue(
      'etiquetas',
      etiquetas.filter((item) => item !== tag)
    );
  };

  const onSubmit = async (values) => {
    if (isEditing) {
      await actualizarTema.mutateAsync({ id, data: values });
    } else {
      await crearTema.mutateAsync(values);
    }
    navigate('/foro');
  };

  if (isEditing && isLoading) {
    return <Loading message="Cargando tema" />;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">
        {isEditing ? 'Editar tema' : 'Nuevo tema'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">Compartí información o dudas con la comunidad.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <Input label="Título" {...register('titulo')} error={errors.titulo?.message} />
        <TextArea
          label="Contenido"
          rows={8}
          {...register('contenido')}
          error={errors.contenido?.message}
          maxLength={4000}
        />
        <Select
          label="Categoría"
          options={categoriasOptions}
          value={categoriasOptions.find((option) => option.value === watch('categoria'))}
          onChange={(option) => setValue('categoria', option?.value ?? '')}
          error={errors.categoria?.message}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700">Etiquetas</label>
          <div className="mt-2 flex gap-2">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Presioná Enter para agregar"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              Agregar
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {etiquetas.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => handleRemoveTag(tag)}
                className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
              >
                #{tag} ×
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || crearTema.isPending || actualizarTema.isPending}>
            {isEditing ? 'Guardar cambios' : 'Publicar tema'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ForoTemaForm;
