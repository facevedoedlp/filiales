import { useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import IntegranteDetail from '../../components/integrantes/IntegranteDetail';
import { useIntegrante } from '../../hooks/useIntegrantes';

const IntegranteDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useIntegrante(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return <IntegranteDetail integrante={data} />;
};

export default IntegranteDetailPage;
