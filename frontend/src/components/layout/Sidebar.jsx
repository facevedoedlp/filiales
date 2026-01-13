import { NavLink } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  CalendarCheck2,
  Ticket,
  MessageCircle,
  MapPin,
  UserCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';

const linkStyles = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-red-600'
  }`;

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { to: '/filiales', label: 'Filiales', icon: <Building2 className="h-4 w-4" /> },
  { to: '/filiales/mapa', label: 'Mapa de Filiales', icon: <MapPin className="h-4 w-4" /> },
  { to: '/integrantes', label: 'Integrantes', icon: <Users className="h-4 w-4" /> },
  { to: '/acciones', label: 'Acciones', icon: <CalendarCheck2 className="h-4 w-4" /> },
  { to: '/entradas', label: 'Entradas', icon: <Ticket className="h-4 w-4" /> },
  { to: '/foro', label: 'Foro', icon: <MessageCircle className="h-4 w-4" /> },
  { to: '/perfil', label: 'Mi Perfil', icon: <UserCircle className="h-4 w-4" /> },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white px-4 py-6 shadow-lg transition-transform lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold text-red-600">Estudiantes</h2>
        <button className="rounded-md p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={onClose}>
          ✕
        </button>
      </div>
      <nav className="mt-6 flex flex-col gap-1">
        {links.map((link) => {
          if (link.to === '/entradas' && user?.rol === ROLES.FILIAL) {
            return null;
          }
          return (
            <NavLink key={link.to} to={link.to} className={linkStyles} onClick={onClose}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          );
        })}
        {user?.rol === ROLES.ADMIN && (
          <NavLink to="/entradas/aprobar" className={linkStyles} onClick={onClose}>
            <Ticket className="h-4 w-4" />
            <span>Aprobaciones</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
