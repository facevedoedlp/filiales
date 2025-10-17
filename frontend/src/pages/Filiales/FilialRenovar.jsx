import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useRenovarFilial } from '../../hooks/useFiliales.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import TextArea from '../../components/common/TextArea.jsx';

const renovarSchema = z.object({
  fechaRenovacion: z.string().min(1, 'Seleccioná una fecha'),
  observaciones: z.string().optional(),
  acta: z
    .any()
    .optional()
    .refine(
      (file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024),
      'El archivo debe pesar menos de 5MB'
    ),
});

const FilialRenovar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const renovarFilial = useRenovarFilial();
  const [actaFile, setActaFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(renovarSchema),
    defaultValues: {
      fechaRenovacion: '',
      observaciones: '',
      acta: null,
    },
  });

  useEffect(() => {
    register('acta');
  }, [register]);

  const onSubmit = async (values) => {
    const payload = new FormData();
    payload.append('fechaRenovacion', values.fechaRenovacion);
    if (values.observaciones) {
      payload.append('observaciones', values.observaciones);
    }
    if (actaFile) {
      payload.append('acta', actaFile);
    }

    await renovarFilial.mutateAsync({ id, data: payload });
    navigate(`/filiales/${id}`);
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-slate-900">Renovar autoridades</h1>
      <p className="mt-2 text-sm text-slate-500">
        Registrá la fecha de la renovación y adjuntá el acta si ya la tenés disponible.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <Input
          type="date"
          label="Fecha de renovación"
          {...register('fechaRenovacion')}
          error={errors.fechaRenovacion?.message}
        />

        <TextArea
          label="Observaciones"
          rows={4}
          {...register('observaciones')}
          error={errors.observaciones?.message}
          maxLength={500}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700">Acta (opcional)</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            className="mt-1 block w-full text-sm text-slate-600"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setActaFile(file || null);
              setValue('acta', file || null);
            }}
          />
          {errors.acta ? (
            <span className="mt-1 block text-xs text-red-600">{errors.acta.message}</span>
          ) : null}
          {actaFile ? (
            <p className="mt-2 text-xs text-slate-500">Archivo seleccionado: {actaFile.name}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting || renovarFilial.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || renovarFilial.isPending}>
            {renovarFilial.isPending ? 'Guardando...' : 'Renovar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FilialRenovar;
