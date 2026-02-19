import { useAuth } from './useAuth';

// Roles definidos en el sistema
export const ROLES = {
  ADMIN: 'Admin',
  RECEPCION: 'Recepcion',
  ANALISTA: 'Analista',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: RoleName): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: RoleName[]): boolean => {
    return roles.some((role) => user?.role === role);
  };

  const isAdmin = hasRole(ROLES.ADMIN);
  const isRecepcion = hasRole(ROLES.RECEPCION);
  const isAnalista = hasRole(ROLES.ANALISTA);

  // Todas las acciones CRUD de visitantes y visitas están disponibles para todos los roles
  const canDoCrud = isAuthenticated;

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isRecepcion,
    isAnalista,
    // Accesos por sección (basado en rol, no en permisos de localStorage)
    canAccessUsers: isAdmin,
    canManageUsers: isAdmin,
    canAccessReports: isAdmin || isAnalista,
    // CRUD - disponible para todos los roles autenticados
    canViewVisitors: canDoCrud,
    canCreateVisitors: canDoCrud,
    canEditVisitors: canDoCrud,
    canDeleteVisitors: canDoCrud,
    canViewVisits: canDoCrud,
    canCreateVisits: canDoCrud,
    canEditVisits: canDoCrud,
    canDeleteVisits: canDoCrud,
    canCloseVisits: canDoCrud,
    canExportData: isAdmin || isAnalista,
    canViewReports: isAdmin || isAnalista,
  };
};
