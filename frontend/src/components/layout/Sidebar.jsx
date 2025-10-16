import { NavLink } from 'react-router-dom';
import { Home, Users, Building2, Ticket, MessageSquare, Megaphone } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/filiales', label: 'Filiales', icon: Building2 },
  { to: '/integrantes', label: 'Integrantes', icon: Users },
  { to: '/acciones', label: 'Acciones', icon: Megaphone },
  { to: '/entradas', label: 'Entradas', icon: Ticket },
  { to: '/foro', label: 'Foro', icon: MessageSquare },
];

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium ${
        isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-slate-100'
      }`
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
      <nav className="space-y-1">
        {links.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
