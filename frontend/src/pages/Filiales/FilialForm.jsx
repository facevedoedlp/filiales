import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useCreateFilial, useUpdateFilial } from '../../hooks/useFiliales.js';
import api from '../../api/client.js';

const schema = z.object({
  nombre: z.string(),
  nombreLocalidad: z.string(),
  paisId: z.coerce.number(),
  provinciaId: z.coerce.number(),
  localidadId: z.coerce.number(),
  esActiva: z.coerce.boolean().default(true),
  telefono: z.string().optional(),
});

const FilialForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { esActiva: true } });

  const createMutation = useCreateFilial();
  const updateMutation = useUpdateFilial();

  useEffect(() => {
    if (isEdit) {
      api.get(`/filiales/${id}`).then(({ data }) => {
        reset({
          nombre: data.data.nombre,
          nombreLocalidad: data.data.nombreLocalidad,
          paisId: data.data.paisId,
          provinciaId: data.data.provinciaId,
          localidadId: data.data.localidadId,
          esActiva: data.data.esActiva,
          telefono: data.data.telefono ?? '',
        });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    navigate('/filiales');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {isEdit ? 'Editar filial' : 'Crear nueva filial'}
        </h2>
      </div>
      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Nombre" {...register('nombre')} />
        <Input label="Nombre de la localidad" {...register('nombreLocalidad')} />
        <Input label="País" type="number" {...register('paisId')} />
        <Input label="Provincia" type="number" {...register('provinciaId')} />
        <Input label="Localidad" type="number" {...register('localidadId')} />
        <Input label="Teléfono" {...register('telefono')} />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" {...register('esActiva')} /> Filial activa
        </label>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </section>
  );
};

export default FilialForm;
