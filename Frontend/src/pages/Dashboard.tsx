import React from 'react';
import { useTheme } from '../context/ThemeContext';
import KPICards from '../components/dashboard/KPICards';
import VisitChart from '../components/dashboard/VisitChart';
import ActiveVisitsTable from '../components/dashboard/ActiveVisitsTable';
import RecentVisitorsWidget from '../components/dashboard/RecentVisitorsWidget';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-8 pb-8">
      <h1 className={`text-4xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
      <KPICards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VisitChart />
        </div>
        <div>
          <RecentVisitorsWidget />
        </div>
      </div>
      <ActiveVisitsTable />
    </div>
  );
};

export default Dashboard;
