import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Home, 
  Users, 
  UserCircle, 
  Zap, 
  Ticket, 
  MessageSquare,
  Bell 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuthStore();

  const menuItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/filiales', icon: Users, label: 'Filiales' },
    { to: '/integrantes', icon: UserCircle, label: 'Integrantes' },
    { to: '/acciones', icon: Zap, label: 'Acciones' },
    { to: '/entradas', icon: Ticket, label: 'Entradas' },
    { to: '/foro', icon: MessageSquare, label: 'Foro' },
    { to: '/notificaciones', icon: Bell, label: 'Notificaciones' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-100 text-red-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
