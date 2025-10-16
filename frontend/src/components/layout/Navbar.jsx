import { useNavigate } from 'react-router-dom';
import Button from '../common/Button.jsx';
import useAuth from '../../hooks/useAuth.js';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-primary">Filiales Estudiantes</h1>
        <p className="text-sm text-slate-500">Gestión integral de filiales y acciones</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">{user?.nombre}</p>
          <p className="text-xs text-slate-500">{user?.rol}</p>
        </div>
        <Button variant="ghost" onClick={() => { logout(); navigate('/login'); }}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
