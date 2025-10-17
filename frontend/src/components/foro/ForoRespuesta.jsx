import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import TextArea from '../common/TextArea.jsx';

const ForoRespuesta = ({
  respuesta,
  puedeEditar,
  puedeEliminar,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(respuesta.contenido);

  const handleSave = async () => {
    await onUpdate(content);
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{respuesta.autorNombre}</p>
          <p className="text-xs text-slate-500">
            {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
              new Date(respuesta.creadoEn)
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {puedeEditar ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing((prev) => !prev)}>
              <Pencil className="mr-1 h-4 w-4" /> {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          ) : null}
          {puedeEliminar ? (
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="mr-1 h-4 w-4" /> Eliminar
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-600">
        {isEditing ? (
          <div className="space-y-3">
            <TextArea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <p>{respuesta.contenido}</p>
        )}
      </div>
    </div>
  );
};

export default ForoRespuesta;
