import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client.js';
import Loading from '../../components/common/Loading.jsx';
import Button from '../../components/common/Button.jsx';
import { formatDate, formatBoolean } from '../../utils/formatters.js';

const FilialDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['filial', id],
    queryFn: async () => {
      const { data } = await api.get(`/filiales/${id}`);
      return data.data;
    },
  });

  if (isLoading) {
    return <Loading message="Cargando filial..." />;
  }

  if (!data) {
    return <p>No se encontró la filial solicitada.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{data.nombre}</h2>
          <p className="text-sm text-slate-500">Localidad: {data.nombreLocalidad}</p>
        </div>
        <Button as={Link} to={`/filiales/${id}/editar`}>
          Editar
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-primary">Información general</h3>
          <dl className="mt-4 space-y-2 text-sm text-slate-600">
            <div>
              <dt className="font-semibold">Fundación</dt>
              <dd>{formatDate(data.fechaFundacion)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Activa</dt>
              <dd>{formatBoolean(data.esActiva)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Habilitada</dt>
              <dd>{formatBoolean(data.esHabilitada)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Teléfono</dt>
              <dd>{data.telefono ?? '—'}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-primary">Integrantes</h3>
          <p className="mt-2 text-sm text-slate-500">
            Cantidad registrada: {data.integrantes?.length ?? 0}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FilialDetail;
