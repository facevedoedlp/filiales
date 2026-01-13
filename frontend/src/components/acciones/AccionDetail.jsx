import { useMemo } from 'react';
import { Card } from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const AccionDetail = ({ accion }) => {
  const imagenes = useMemo(() => {
    if (!accion) return [];
    const list = accion.imagenes || [];
    const principal = accion.imagen_principal_url || accion.imagen_principal;
    if (principal) {
      return [principal, ...list.filter((img) => img !== principal)];
    }
    return list;
  }, [accion]);

  if (!accion) return null;

  return (
    <div className="space-y-6">
      <Card title={accion.nombre} description={accion.filial_nombre}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="info">{formatDate(accion.fecha)}</Badge>
          <Badge variant="success">{accion.estado}</Badge>
        </div>
        <p className="mt-4 text-sm text-slate-600">{accion.descripcion}</p>
      </Card>

      {imagenes.length > 0 && (
        <Card title="Galería de imágenes">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imagenes.map((imagen, index) => (
              <img key={index} src={imagen} alt={`Imagen ${index + 1}`} className="h-48 w-full rounded-md object-cover" />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AccionDetail;
