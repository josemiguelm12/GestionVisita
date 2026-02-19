import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, BadgeCheck, BarChart3, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { usePermissions } from '../../hooks/usePermissions';

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { theme } = useTheme();
  const { canAccessReports, canAccessUsers } = usePermissions();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
      isCollapsed ? 'justify-center' : ''
    } ${
      isActive 
        ? theme === 'dark'
          ? 'bg-slate-700 text-white'
          : 'bg-gray-200 text-gray-900'
        : theme === 'dark'
          ? 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
          : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <aside 
      className={`hidden md:flex flex-col border-r transition-all duration-300 flex-shrink-0 fixed top-14 left-0 z-10 h-[calc(100vh-3.5rem)] ${
        isCollapsed ? 'w-20' : 'w-60'
      } ${
        theme === 'dark' 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-gray-200'
      }`}
    >
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <NavLink 
          to="/dashboard" 
          className={navItemClass}
          title={isCollapsed ? 'Dashboard' : ''}
        >
          <LayoutGrid className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink 
          to="/visitors" 
          className={navItemClass}
          title={isCollapsed ? 'Visitantes' : ''}
        >
          <Users className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Visitantes</span>}
        </NavLink>

        <NavLink 
          to="/visits" 
          className={navItemClass}
          title={isCollapsed ? 'Visitas' : ''}
        >
          <BadgeCheck className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Visitas</span>}
        </NavLink>

        {canAccessReports && (
          <NavLink 
            to="/reports" 
            className={navItemClass}
            title={isCollapsed ? 'Reportes' : ''}
          >
            <BarChart3 className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Reportes</span>}
          </NavLink>
        )}

        {canAccessUsers && (
          <NavLink 
            to="/users" 
            className={navItemClass}
            title={isCollapsed ? 'Usuarios' : ''}
          >
            <UserCog className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Usuarios</span>}
          </NavLink>
        )}
      </nav>

      {/* Toggle Button */}
      <div className={`p-3 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
        <button
          onClick={toggleCollapse}
          className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={isCollapsed ? 'Expandir' : 'Contraer'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Contraer</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
