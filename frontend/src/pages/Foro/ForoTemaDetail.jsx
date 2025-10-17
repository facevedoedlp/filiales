import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Pin, Reply, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import {
  useActualizarRespuesta,
  useCrearRespuesta,
  useEliminarRespuesta,
  useEliminarTema,
  useGestionTema,
  useTema,
} from '../../hooks/useForo.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import TextArea from '../../components/common/TextArea.jsx';
import Button from '../../components/common/Button.jsx';
import ForoRespuesta from '../../components/foro/ForoRespuesta.jsx';

const ForoTemaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading } = useTema(id);
  const crearRespuesta = useCrearRespuesta();
  const actualizarRespuesta = useActualizarRespuesta();
  const eliminarRespuesta = useEliminarRespuesta();
  const eliminarTema = useEliminarTema();
  const gestionarTema = useGestionTema();
  const [respuesta, setRespuesta] = useState('');

  const tema = data?.data;
  const respuestas = tema?.respuestas || [];
  const puedeGestionar = user?.rol === 'ADMIN' || user?.id === tema?.autorId;

  const handleResponder = async () => {
    if (!respuesta.trim()) return;
    await crearRespuesta.mutateAsync({ id, data: { contenido: respuesta } });
    setRespuesta('');
  };

  const handleEliminarTema = async () => {
    await eliminarTema.mutateAsync(tema.id);
    navigate('/foro');
  };

  if (isLoading) {
    return <Loading message="Cargando tema" />;
  }

  if (!tema) {
    return <EmptyState title="Tema no encontrado" description="El contenido pudo haber sido eliminado." />;
  }

  const puedeEditarTema = puedeGestionar && Date.now() - new Date(tema.creadoEn).getTime() < 15 * 60 * 1000;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{tema.titulo}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Publicado por {tema.autorNombre} · {tema.filialNombre}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tema.destacado ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <Pin className="h-3 w-3" /> Destacado
              </span>
            ) : null}
            {tema.cerrado ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-600">
                <Lock className="h-3 w-3" /> Tema cerrado
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 whitespace-pre-wrap text-sm text-slate-700">{tema.contenido}</div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tema.etiquetas?.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              #{tag}
            </span>
          ))}
        </div>

        {puedeGestionar ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {puedeEditarTema ? (
              <Link to={`/foro/tema/${id}/editar`}>
                <Button variant="outline">Editar tema</Button>
              </Link>
            ) : null}
            <Button
              variant="outline"
              onClick={() => gestionarTema.mutate({ id, action: 'cerrar' })}
              disabled={gestionarTema.isPending || tema.cerrado}
            >
              {tema.cerrado ? 'Tema cerrado' : 'Cerrar tema'}
            </Button>
            {user?.rol === 'ADMIN' ? (
              <Button
                variant="outline"
                onClick={() => gestionarTema.mutate({ id, action: 'destacar' })}
                disabled={gestionarTema.isPending}
              >
                {tema.destacado ? 'Destacado' : 'Destacar'}
              </Button>
            ) : null}
            {user?.rol === 'ADMIN' ? (
              <Button variant="outline" onClick={handleEliminarTema}>
                <Trash2 className="mr-1 h-4 w-4" /> Eliminar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Respuestas ({respuestas.length})</h2>
        {respuestas.length === 0 ? (
          <EmptyState title="Sé el primero en responder" description="Comparte tu opinión con la comunidad." />
        ) : (
          <div className="space-y-3">
            {respuestas.map((respuestaItem) => {
              const puedeEditarRespuesta =
                respuestaItem.autorId === user?.id &&
                Date.now() - new Date(respuestaItem.creadoEn).getTime() < 15 * 60 * 1000;
              const puedeEliminarRespuesta =
                respuestaItem.autorId === user?.id || user?.rol === 'ADMIN';
              return (
                <ForoRespuesta
                  key={respuestaItem.id}
                  respuesta={respuestaItem}
                  puedeEditar={puedeEditarRespuesta}
                  puedeEliminar={puedeEliminarRespuesta}
                  onUpdate={(contenido) =>
                    actualizarRespuesta.mutate({ id: respuestaItem.id, data: { contenido }, temaId: tema.id })
                  }
                  onDelete={() => eliminarRespuesta.mutate({ id: respuestaItem.id, temaId: tema.id })}
                />
              );
            })}
          </div>
        )}
      </section>

      {!tema.cerrado ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Responder</h3>
          <TextArea value={respuesta} onChange={(event) => setRespuesta(event.target.value)} rows={4} maxLength={2000} />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleResponder} disabled={crearRespuesta.isPending || !respuesta.trim()}>
              <Reply className="mr-1 h-4 w-4" /> Publicar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ForoTemaDetail;
