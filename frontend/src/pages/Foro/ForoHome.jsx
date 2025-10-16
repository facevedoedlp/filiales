import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import { useTemasForo } from '../../hooks/useForo.js';
import Loading from '../../components/common/Loading.jsx';
import ForoList from '../../components/foro/ForoList.jsx';

const ForoHome = () => {
  const { data, isLoading } = useTemasForo();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Foro</h2>
          <p className="text-sm text-slate-500">Comparte novedades y experiencias con otras filiales</p>
        </div>
        <Button as={Link} to="/foro/nuevo">
          Nuevo tema
        </Button>
      </div>
      {isLoading ? <Loading /> : <ForoList temas={data ?? []} />}
    </section>
  );
};

export default ForoHome;
