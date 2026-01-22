using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Data;
using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Repositories.Implementations;

/// <summary>
/// Implementación del repositorio de logs de auditoría
/// </summary>
public class AuditLogRepository : Repository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<AuditLog>> GetLogsByUserAsync(int userId)
    {
        return await _dbSet
            .Include(al => al.User)
            .Where(al => al.UserId == userId)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetLogsByResourceAsync(string resourceType, int? resourceId = null)
    {
        var query = _dbSet
            .Include(al => al.User)
            .Where(al => al.ResourceType == resourceType);

        if (resourceId.HasValue)
        {
            query = query.Where(al => al.ResourceId == resourceId.Value);
        }

        return await query
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetLogsByActionAsync(string action)
    {
        return await _dbSet
            .Include(al => al.User)
            .Where(al => al.Action == action)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetSecurityIncidentsAsync()
    {
        return await _dbSet
            .Include(al => al.User)
            .Where(al => 
                al.Severity == AuditSeverity.High || 
                al.Severity == AuditSeverity.Critical)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Include(al => al.User)
            .Where(al => al.CreatedAt >= startDate && al.CreatedAt <= endDate)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }
}
