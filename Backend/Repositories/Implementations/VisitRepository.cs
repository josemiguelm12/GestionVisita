using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Data;
using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Repositories.Implementations;

/// <summary>
/// Implementaci�n del repositorio de visitas
/// Mapea VisitRepository de Laravel
/// </summary>
public class VisitRepository : Repository<Visit>, IVisitRepository
{
    public VisitRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Visit?> GetVisitWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Closer)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<Visit>> GetActiveVisitsAsync(string? search = null)
    {
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.StatusId == (int)Enums.VisitStatus.Abierto);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.NamePersonToVisit.Contains(search) ||
                v.Department.Contains(search) ||
                (v.VehiclePlate != null && v.VehiclePlate.Contains(search)) ||
                v.Visitors.Any(vis => vis.Name.Contains(search) || vis.LastName.Contains(search))
            );
        }

        return await query
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetActiveMissionVisitsAsync(string? search = null)
    {
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.StatusId == (int)Enums.VisitStatus.Abierto && v.MissionCase);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.NamePersonToVisit.Contains(search) ||
                v.Department.Contains(search) ||
                v.Visitors.Any(vis => vis.Name.Contains(search) || vis.LastName.Contains(search))
            );
        }

        return await query
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetActiveNonMissionVisitsAsync(string? search = null)
    {
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.StatusId == (int)Enums.VisitStatus.Abierto && !v.MissionCase);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.NamePersonToVisit.Contains(search) ||
                v.Department.Contains(search) ||
                v.Visitors.Any(vis => vis.Name.Contains(search) || vis.LastName.Contains(search))
            );
        }

        return await query
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetClosedTodayVisitsAsync(string? search = null)
    {
        var today = DateTime.UtcNow.Date;
        
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Closer)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.StatusId == (int)Enums.VisitStatus.Cerrado && 
                        v.EndAt.HasValue && 
                        v.EndAt.Value.Date == today);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.NamePersonToVisit.Contains(search) ||
                v.Department.Contains(search) ||
                v.Visitors.Any(vis => vis.Name.Contains(search) || vis.LastName.Contains(search))
            );
        }

        return await query
            .OrderByDescending(v => v.EndAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetTodayVisitsAsync(string? search = null)
    {
        var today = DateTime.UtcNow.Date;
        
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.CreatedAt.Date == today);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.NamePersonToVisit.Contains(search) ||
                v.Department.Contains(search) ||
                v.Visitors.Any(vis => vis.Name.Contains(search) || vis.LastName.Contains(search))
            );
        }

        return await query
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetVisitsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.CreatedAt >= startDate && v.CreatedAt <= endDate)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetVisitsByDepartmentAsync(string department)
    {
        return await _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.Department == department)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetVisitsByStatusAsync(int statusId)
    {
        return await _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .Where(v => v.StatusId == statusId)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> SearchVisitsAsync(Dictionary<string, object> filters)
    {
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Closer)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .AsQueryable();

        query = ApplyFilters(query, filters);

        return await query
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Visit> Data, int Total)> GetVisitsPaginatedAsync(
        Dictionary<string, object> filters, 
        int page = 1, 
        int pageSize = 15)
    {
        var query = _dbSet
            .Include(v => v.Creator)
            .Include(v => v.Closer)
            .Include(v => v.Status)
            .Include(v => v.Visitors)
            .AsQueryable();

        query = ApplyFilters(query, filters);

        var total = await query.CountAsync();
        
        var data = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (data, total);
    }

    private IQueryable<Visit> ApplyFilters(IQueryable<Visit> query, Dictionary<string, object> filters)
    {
        foreach (var filter in filters)
        {
            switch (filter.Key.ToLower())
            {
                case "search":
                    if (filter.Value is string searchTerm && !string.IsNullOrWhiteSpace(searchTerm))
                    {
                        query = query.Where(v =>
                            v.NamePersonToVisit.Contains(searchTerm) ||
                            v.Department.Contains(searchTerm) ||
                            (v.VehiclePlate != null && v.VehiclePlate.Contains(searchTerm)) ||
                            v.Visitors.Any(vis => vis.Name.Contains(searchTerm) || vis.LastName.Contains(searchTerm))
                        );
                    }
                    break;

                case "status_id":
                    if (filter.Value is int statusId)
                    {
                        query = query.Where(v => v.StatusId == statusId);
                    }
                    break;

                case "department":
                    if (filter.Value is string department && !string.IsNullOrWhiteSpace(department))
                    {
                        query = query.Where(v => v.Department == department);
                    }
                    break;

                case "date_from":
                    if (filter.Value is DateTime dateFrom)
                    {
                        query = query.Where(v => v.CreatedAt >= dateFrom);
                    }
                    break;

                case "date_to":
                    if (filter.Value is DateTime dateTo)
                    {
                        query = query.Where(v => v.CreatedAt <= dateTo);
                    }
                    break;

                case "mission_case":
                    if (filter.Value is bool missionCase)
                    {
                        query = query.Where(v => v.MissionCase == missionCase);
                    }
                    break;

                case "has_vehicle":
                    if (filter.Value is bool hasVehicle && hasVehicle)
                    {
                        query = query.Where(v => v.VehiclePlate != null && v.VehiclePlate != "");
                    }
                    break;
            }
        }

        return query;
    }
}
