import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import Badge from '../components/common/Badge';
import { ROLES_LABELS } from '../utils/constants';

const Perfil = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mi perfil</h1>
        <p className="text-sm text-slate-500">Información personal y de la filial asignada.</p>
      </div>
      <Card title={user.nombre} description={user.email}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="info">{ROLES_LABELS[user.rol] || user.rol}</Badge>
          <Badge variant="success">{user.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</Badge>
        </div>
        <dl className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-600">
          <div>
            <dt className="font-semibold text-slate-700">Filial</dt>
            <dd>{user.filial_nombre}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Teléfono</dt>
            <dd>{user.telefono || 'No registrado'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Fecha de ingreso</dt>
            <dd>{user.fecha_ingreso}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
};

export default Perfil;
