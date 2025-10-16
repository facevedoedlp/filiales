import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client.js';
import Loading from '../../components/common/Loading.jsx';
import ForoRespuesta from '../../components/foro/ForoRespuesta.jsx';

const ForoTemaDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['foro', id],
    queryFn: async () => {
      const { data } = await api.get(`/foro/${id}`);
      return data.data;
    },
  });

  if (isLoading) {
    return <Loading message="Cargando tema..." />;
  }

  if (!data) {
    return <p>No se encontró el tema solicitado.</p>;
  }

  return (
    <section className="space-y-6">
      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">{data.titulo}</h2>
        <p className="mt-2 text-sm text-slate-500">{data.contenido}</p>
      </article>
      <div className="space-y-4">
        {data.respuestas?.map((respuesta) => (
          <ForoRespuesta key={respuesta.id} respuesta={respuesta} />
        ))}
      </div>
    </section>
  );
};

export default ForoTemaDetail;
