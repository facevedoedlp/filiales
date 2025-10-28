import { Link, useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import HiloCard from '../../components/foro/HiloCard';
import { useHilos } from '../../hooks/useForo';

const CategoriaPage = () => {
  const { slug } = useParams();
  const { hilos, isLoading } = useHilos({ categoria: slug });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hilos</h1>
          <p className="text-sm text-slate-500">Participa de las conversaciones de la categoría.</p>
        </div>
        <Link
          to="/foro/nuevo"
          className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Nuevo hilo
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hilos.map((hilo) => (
            <HiloCard key={hilo.id} hilo={hilo} />
          ))}
          {hilos.length === 0 && <p className="col-span-full text-sm text-slate-500">No hay hilos en esta categoría.</p>}
        </div>
      )}
    </div>
  );
};

export default CategoriaPage;
