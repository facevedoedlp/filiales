import { useState } from 'react';
import { useCategorias, useHilos } from '../../hooks/useForo';
import CategoriaList from '../../components/foro/CategoriaList';
import HiloCard from '../../components/foro/HiloCard';
import { Modal } from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import Input from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { composeValidators, required } from '../../utils/validators';
import Spinner from '../../components/common/Spinner';

const ForoHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categorias, isLoading: isLoadingCategorias, createCategoria } = useCategorias();
  const { hilos, isLoading: isLoadingHilos } = useHilos({ limit: 6 });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  });

  const onSubmit = (values) => {
    createCategoria(values, {
      onSuccess: () => {
        reset();
        setIsModalOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Foro institucional</h1>
          <p className="text-sm text-slate-500">Comparte novedades y debates entre filiales.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Nueva categoría</Button>
      </div>

      {isLoadingCategorias ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <CategoriaList categorias={categorias} onCreate={() => setIsModalOpen(true)} />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Hilos recientes</h2>
        </div>
        {isLoadingHilos ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hilos.map((hilo) => (
              <HiloCard key={hilo.id} hilo={hilo} />
            ))}
            {hilos.length === 0 && <p className="col-span-full text-sm text-slate-500">No hay hilos aún.</p>}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva categoría">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            {...register('nombre', composeValidators(required()))}
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Descripción
            <textarea
              rows={4}
              className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.descripcion ? 'border-red-500' : ''
              }`}
              {...register('descripcion', composeValidators(required()))}
            />
            {errors.descripcion && <span className="text-xs text-red-600">{errors.descripcion.message}</span>}
          </label>
          <div className="flex justify-end">
            <Button type="submit">Crear categoría</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ForoHome;
