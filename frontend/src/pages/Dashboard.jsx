import { useQuery } from '@tanstack/react-query';
import api from '../api/client.js';
import Loading from '../components/common/Loading.jsx';

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/filiales', { params: { limit: 5 } });
      return data.data;
    },
  });


  if (isLoading) {
    return <Loading message="Cargando resumen..." />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Panel de control</h2>
        <p className="text-sm text-slate-500">Últimas filiales registradas</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.items?.map((filial) => (
          <article key={filial.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-primary">{filial.nombre}</h3>
            <p className="text-sm text-slate-500">Provincia: {filial.provincia?.nombre}</p>
            <p className="text-sm text-slate-500">País: {filial.pais?.nombre}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
