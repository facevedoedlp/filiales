import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          ¡Bienvenido, {user?.nombre}! 👋
        </h2>
        <p className="text-gray-600">
          Sistema de Gestión de Filiales - Club Estudiantes de La Plata
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Filiales</h3>
            <span className="text-3xl">🏘️</span>
          </div>
          <p className="text-3xl font-bold text-red-600">--</p>
          <p className="text-sm text-gray-500 mt-2">Filiales activas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Integrantes</h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-red-600">--</p>
          <p className="text-sm text-gray-500 mt-2">Total de integrantes</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Acciones</h3>
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-3xl font-bold text-red-600">--</p>
          <p className="text-sm text-gray-500 mt-2">Este mes</p>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🚀 Próximos pasos</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Explora las secciones desde el menú lateral</li>
          <li>• Revisa la información de tu filial</li>
          <li>• Participa en el foro de la comunidad</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
