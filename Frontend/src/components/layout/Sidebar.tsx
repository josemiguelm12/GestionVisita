import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, BadgeCheck, BarChart3 } from 'lucide-react';

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
  }`;

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex md:w-60 border-r bg-white">
      <nav className="w-full p-3 space-y-1">
        <NavLink to="/dashboard" className={navItemClass}>
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink to="/visitors" className={navItemClass}>
          <Users className="h-4 w-4" />
          Visitantes
        </NavLink>
        <NavLink to="/visits" className={navItemClass}>
          <BadgeCheck className="h-4 w-4" />
          Visitas
        </NavLink>
        <NavLink to="/reports" className={navItemClass}>
          <BarChart3 className="h-4 w-4" />
          Reportes
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
