import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { ROLES_LABELS } from '../../utils/constants';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setTimeout(() => setIsLoggingOut(false), 500);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/dashboard" className="text-lg font-semibold text-red-600">
          Sistema de Filiales
        </Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <p className="font-semibold text-slate-900">{user?.nombre || 'Usuario'}</p>
          <p className="text-xs text-slate-500">{ROLES_LABELS[user?.rol] || 'Sin rol'}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut} leftIcon={<LogOut className="h-4 w-4" />}>
          Salir
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
