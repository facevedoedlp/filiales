import { useAuthStore } from '../../store/authStore';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

const Navbar = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <nav className="bg-red-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Filiales EDLP</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              👤 {user?.nombre} 
              <span className="ml-2 text-xs bg-red-900 px-2 py-1 rounded">
                {user?.rol}
              </span>
            </span>
            <Button 
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-red-800"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
