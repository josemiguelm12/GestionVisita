import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import Visits from './pages/Visits';
import Reports from './pages/Reports';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import { ROLES } from './hooks/usePermissions';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/visitors" element={
              <ProtectedRoute>
                <Layout>
                  <Visitors />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/visits" element={
              <ProtectedRoute>
                <Layout>
                  <Visits />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALISTA]}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;

