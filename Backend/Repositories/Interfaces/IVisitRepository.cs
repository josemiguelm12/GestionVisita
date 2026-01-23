using GestionVisitaAPI.Models;

namespace GestionVisitaAPI.Repositories.Interfaces;

/// <summary>
/// Repositorio específico para Visit con consultas personalizadas
/// Mapea VisitRepositoryInterface de Laravel
/// </summary>
public interface IVisitRepository : IRepository<Visit>
{
    Task<IEnumerable<Visit>> GetActiveVisitsAsync(string? search = null);
    Task<IEnumerable<Visit>> GetActiveMissionVisitsAsync(string? search = null);
    Task<IEnumerable<Visit>> GetActiveNonMissionVisitsAsync(string? search = null);
    Task<IEnumerable<Visit>> GetClosedTodayVisitsAsync(string? search = null);
    Task<IEnumerable<Visit>> GetTodayVisitsAsync(string? search = null);
    Task<IEnumerable<Visit>> GetVisitsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Visit>> GetVisitsByDepartmentAsync(string department);
    Task<IEnumerable<Visit>> GetVisitsByStatusAsync(int statusId);
    Task<Visit?> GetVisitWithDetailsAsync(int id);
    Task<IEnumerable<Visit>> SearchVisitsAsync(Dictionary<string, object> filters);
    Task<(IEnumerable<Visit> Data, int Total)> GetVisitsPaginatedAsync(
        Dictionary<string, object> filters, 
        int page = 1, 
        int pageSize = 15
    );
}
