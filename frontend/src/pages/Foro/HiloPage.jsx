import { useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import HiloDetail from '../../components/foro/HiloDetail';
import RespuestaForm from '../../components/foro/RespuestaForm';
import { useHilo, useHilos, useRespuestas } from '../../hooks/useForo';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const HiloPage = () => {
  const { id } = useParams();
  const { data: hilo, isLoading } = useHilo(id);
  const { toggleHilo } = useHilos();
  const { createRespuesta } = useRespuestas({ hilo: id });
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const canToggle = user?.rol === ROLES.ADMIN || user?.id === hilo?.autor;

  return (
    <HiloDetail
      hilo={hilo}
      onToggle={canToggle ? (current) => toggleHilo({ id: current.id, data: {} }) : undefined}
    >
      <RespuestaForm
        onSubmit={(values, { reset }) =>
          createRespuesta(
            { ...values, hilo: id },
            {
              onSuccess: () => reset(),
            },
          )
        }
      />
    </HiloDetail>
  );
};

export default HiloPage;
