import Spinner from '../../components/common/Spinner';
import { MapaFiliales } from '../../components/filiales/MapaFiliales';
import { useFiliales } from '../../hooks/useFiliales';

const FilialesMap = () => {
  const { mapaData, isMapaLoading } = useFiliales();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mapa de filiales</h1>
        <p className="text-sm text-slate-500">Visualiza la ubicación de todas las filiales.</p>
      </div>
      {isMapaLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <MapaFiliales filiales={mapaData} />
      )}
    </div>
  );
};

export default FilialesMap;
