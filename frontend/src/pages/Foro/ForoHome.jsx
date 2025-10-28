import { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { useCategorias, useHilos } from '../../hooks/useForo';
import { composeValidators, required } from '../../utils/validators';

const ForoHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: categoriasData, categorias, isLoading: isLoadingCategorias, isError: categoriasError, error: categoriasErrorInfo, createCategoria } =
    useCategorias();
  const {
    data: hilosData,
    hilos,
    isLoading: isLoadingHilos,
    isError: hilosError,
    error: hilosErrorInfo,
  } = useHilos({ page_size: 6 });

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

  const categoriasList = categoriasData?.resultados || categoriasData?.results || categorias || [];
  const hilosList = hilosData?.resultados || hilosData?.results || hilos || [];

  const onSubmit = async (values) => {
    await createCategoria(values);
    reset();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Foro institucional</h1>
          <p className="text-sm text-slate-500">Comparte novedades, ideas y debates entre todas las filiales.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          Nueva categoría
        </Button>
      </header>

      {isLoadingCategorias ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : categoriasError ? (
        <EmptyState
          title="No pudimos cargar las categorías"
          description={categoriasErrorInfo?.message || 'Intenta nuevamente en unos minutos.'}
        />
      ) : categoriasList.length === 0 ? (
        <EmptyState
          title="Aún no hay categorías"
          description="Crea la primera categoría para organizar el contenido del foro."
          action={<Button onClick={() => setIsModalOpen(true)}>Crear categoría</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoriasList.map((categoria) => (
            <Card key={categoria.id} title={categoria.nombre} description={categoria.descripcion}>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Hilos: {categoria.total_hilos ?? categoria.hilos_count ?? 0}</span>
                <span>Respuestas: {categoria.total_respuestas ?? categoria.respuestas_count ?? 0}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Hilos recientes</h2>
        </div>
        {isLoadingHilos ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : hilosError ? (
          <EmptyState
            title="No pudimos cargar los hilos"
            description={hilosErrorInfo?.message || 'Intenta nuevamente más tarde.'}
          />
        ) : hilosList.length === 0 ? (
          <EmptyState
            title="Todavía no hay conversaciones"
            description="Cuando se publique un nuevo hilo aparecerá aquí."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hilosList.map((hilo) => (
              <Card key={hilo.id}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{hilo.titulo}</h3>
                      <p className="text-xs text-slate-500">Por {hilo.autor_nombre || hilo.autor?.nombre}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c41230]/10 text-[#c41230]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{hilo.descripcion?.slice(0, 120)}...</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Respuestas: {hilo.total_respuestas ?? hilo.respuestas_count ?? 0}</span>
                    <span>Última actualización: {hilo.actualizado_en || hilo.updated_at}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva categoría">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            placeholder="Ingresá un título"
            {...register('nombre', composeValidators(required()))}
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Descripción
            <textarea
              rows={4}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.descripcion ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#c41230] focus:ring-[#c41230]'
              }`}
              placeholder="Explicá de qué trata la categoría"
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
