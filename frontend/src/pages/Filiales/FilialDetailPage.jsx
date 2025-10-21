import { useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { FilialDetail } from '../../components/filiales/FilialDetail';
import { useFilial } from '../../hooks/useFiliales';

const FilialDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useFilial(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilialDetail filial={data} />
    </div>
  );
};

export default FilialDetailPage;
