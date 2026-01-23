using GestionVisitaAPI.Models;

namespace GestionVisitaAPI.Repositories.Interfaces;

/// <summary>
/// Repositorio específico para AuditLog
/// </summary>
public interface IAuditLogRepository : IRepository<AuditLog>
{
    Task<IEnumerable<AuditLog>> GetLogsByUserAsync(int userId);
    Task<IEnumerable<AuditLog>> GetLogsByResourceAsync(string resourceType, int? resourceId = null);
    Task<IEnumerable<AuditLog>> GetLogsByActionAsync(string action);
    Task<IEnumerable<AuditLog>> GetSecurityIncidentsAsync();
    Task<IEnumerable<AuditLog>> GetLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
}
