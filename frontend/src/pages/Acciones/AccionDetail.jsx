import { useParams } from 'react-router-dom';
import { Camera, CalendarClock, MapPin, User } from 'lucide-react';
import { useAccion } from '../../hooks/useAcciones.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const AccionDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useAccion(id);
  const accion = data?.data;

  if (isLoading) {
    return <Loading message="Cargando acción" />;
  }

  if (!accion) {
    return (
      <EmptyState
        title="Acción no encontrada"
        description="Revisá que el enlace sea correcto o que tengas permisos para verla."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-900">{accion.titulo}</h1>
        <p className="mt-2 text-sm text-slate-600">{accion.descripcion}</p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            {new Intl.DateTimeFormat('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(accion.fecha))}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {accion.ubicacion || 'Sin ubicación'}
          </span>
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" /> Encargado: {accion.encargadoNombre || 'No informado'}
          </span>
        </div>
      </div>

      {accion.imagenes?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Galería</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {accion.imagenes.map((imagen) => (
              <img key={imagen.url} src={imagen.url} alt={accion.titulo} className="h-48 w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Camera}
          title="Sin imágenes"
          description="Aún no se cargaron imágenes para esta acción."
        />
      )}
    </div>
  );
};

export default AccionDetail;
