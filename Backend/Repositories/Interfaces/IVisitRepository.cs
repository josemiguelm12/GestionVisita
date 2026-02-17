using GestionVisitaAPI.Models;

namespace GestionVisitaAPI.Repositories.Interfaces;

/// <summary>
/// Repositorio espec�fico para Visit con consultas personalizadas
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
    
    // ========== MÉTODOS OPTIMIZADOS PARA ESTADÍSTICAS ==========
    // Estos métodos solo cuentan, no traen datos completos
    
    /// <summary>
    /// Contar visitas de hoy (solo COUNT, no trae datos)
    /// </summary>
    Task<int> CountTodayVisitsAsync(bool? missionOnly = null);
    
    /// <summary>
    /// Contar visitas en un rango de fechas (solo COUNT, no trae datos)
    /// </summary>
    Task<int> CountVisitsByDateRangeAsync(DateTime startDate, DateTime endDate, bool? missionOnly = null);
    
    /// <summary>
    /// Contar visitas activas (solo COUNT, no trae datos)
    /// </summary>
    Task<int> CountActiveVisitsAsync(bool? missionOnly = null);
    
    /// <summary>
    /// Obtener tendencia diaria agrupada por fecha (GROUP BY en SQL)
    /// Retorna tuplas (Fecha, Count) sin traer visitas completas
    /// </summary>
    Task<List<(DateTime Date, int Count)>> GetDailyTrendAsync(DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Obtener departamentos con más visitas (GROUP BY en SQL)
    /// Retorna tuplas (Departamento, Count)
    /// </summary>
    Task<List<(string Department, int Count)>> GetTopDepartmentsAsync(int limit = 10);
    
    /// <summary>
    /// Obtener departamentos con más visitas en un rango de fechas (GROUP BY en SQL)
    /// </summary>
    Task<List<(string Department, int Count)>> GetTopDepartmentsByDateRangeAsync(DateTime startDate, DateTime endDate, int? limit = null);
}
