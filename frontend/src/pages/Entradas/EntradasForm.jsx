import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useCrearPedidoEntrada, useFixture } from '../../hooks/useEntradas.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import TextArea from '../../components/common/TextArea.jsx';
import Select from '../../components/common/Select.jsx';

const personaSchema = z.object({
  nombreCompleto: z.string().min(3, 'Ingresá el nombre completo'),
  dni: z.string().min(7, 'DNI inválido'),
  procedencia: z.string().min(2, 'Ingresá la procedencia'),
  numeroSocio: z.string().optional().or(z.literal('')),
});

const pedidoSchema = z.object({
  fixtureId: z.union([z.string(), z.number()], 'Seleccioná un partido'),
  personas: z.array(personaSchema).min(1, 'Agregá al menos una persona'),
  observaciones: z.string().optional().or(z.literal('')),
});

const EntradasForm = () => {
  const navigate = useNavigate();
  const crearPedido = useCrearPedidoEntrada();
  const { data: fixtureData } = useFixture({ proximos: true, limit: 20 });

  const fixtureOptions = fixtureData?.data?.items?.map((fixture) => ({
    value: fixture.id,
    label: `${fixture.rival} (${new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(fixture.fecha))})`,
  })) || [];

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      fixtureId: fixtureOptions[0]?.value || '',
      personas: [
        { nombreCompleto: '', dni: '', procedencia: '', numeroSocio: '' },
      ],
      observaciones: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'personas' });

  useEffect(() => {
    if (!watch('fixtureId') && fixtureOptions[0]) {
      setValue('fixtureId', fixtureOptions[0].value);
    }
  }, [fixtureOptions, setValue, watch]);

  const onSubmit = async (values) => {
    await crearPedido.mutateAsync(values);
    navigate('/entradas');
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Solicitar entradas</h1>
      <p className="mt-2 text-sm text-slate-500">
        Completá los datos del partido y de las personas que asistirán.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <Select
          label="Partido"
          options={fixtureOptions}
          value={fixtureOptions.find((option) => String(option.value) === String(watch('fixtureId')))}
          onChange={(option) => setValue('fixtureId', option?.value ?? '')}
          error={errors.fixtureId?.message}
        />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Personas</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nombre completo"
                  {...register(`personas.${index}.nombreCompleto`)}
                  error={errors.personas?.[index]?.nombreCompleto?.message}
                />
                <Input
                  label="DNI"
                  {...register(`personas.${index}.dni`)}
                  error={errors.personas?.[index]?.dni?.message}
                />
                <Input
                  label="Procedencia"
                  {...register(`personas.${index}.procedencia`)}
                  error={errors.personas?.[index]?.procedencia?.message}
                />
                <Input
                  label="Número de socio (opcional)"
                  {...register(`personas.${index}.numeroSocio`)}
                  error={errors.personas?.[index]?.numeroSocio?.message}
                />
              </div>
              {fields.length > 1 ? (
                <div className="mt-3 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => remove(index)}>
                    Eliminar persona
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ nombreCompleto: '', dni: '', procedencia: '', numeroSocio: '' })}
          >
            Agregar persona
          </Button>
        </div>

        <TextArea
          label="Observaciones"
          rows={4}
          {...register('observaciones')}
          error={errors.observaciones?.message}
          maxLength={500}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || crearPedido.isPending}>
            {crearPedido.isPending ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EntradasForm;
