import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'
    }`}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-14">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-60'
        } ${
          theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
