import { useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { FilialDetail } from '../../components/filiales/FilialDetail';
import { useFilial } from '../../hooks/useFiliales';
import { useIntegrantes } from '../../hooks/useIntegrantes';
import { useAcciones } from '../../hooks/useAcciones';

const FilialDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useFilial(id);
  const { integrantes } = useIntegrantes({ filial: id, page_size: 200 });
  const { acciones } = useAcciones({ filial: id, page_size: 50 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilialDetail filial={data} integrantes={integrantes} acciones={acciones} />
    </div>
  );
};

export default FilialDetailPage;
