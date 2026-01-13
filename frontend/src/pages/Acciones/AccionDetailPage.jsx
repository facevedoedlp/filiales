import { useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import AccionDetail from '../../components/acciones/AccionDetail';
import ImageUploader from '../../components/acciones/ImageUploader';
import { useAccion, useAcciones } from '../../hooks/useAcciones';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const AccionDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useAccion(id);
  const { uploadImagen } = useAcciones();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccionDetail accion={data} />
      {user?.rol !== ROLES.FILIAL && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Subir imágenes adicionales</h3>
          <p className="text-xs text-slate-500">Formatos permitidos: JPG, PNG.</p>
          <div className="mt-4">
            <ImageUploader onUpload={(formData) => uploadImagen({ id, formData })} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccionDetailPage;
