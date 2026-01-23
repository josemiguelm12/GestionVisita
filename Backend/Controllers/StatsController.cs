using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Services;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.DTOs.Stats;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador de estadísticas y reportes
/// Mapea StatsController de Laravel
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly VisitService _visitService;
    private readonly IVisitRepository _visitRepository;
    private readonly CacheService _cacheService;
    private readonly ILogger<StatsController> _logger;

    public StatsController(
        VisitService visitService,
        IVisitRepository visitRepository,
        CacheService cacheService,
        ILogger<StatsController> logger)
    {
        _visitService = visitService;
        _visitRepository = visitRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    /// <summary>
    /// Obtener KPIs principales del dashboard
    /// GET /api/stats/kpis
    /// </summary>
    [HttpGet("kpis")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpis([FromQuery] bool? mission_only = null)
    {
        try
        {
            var cacheKey = mission_only == true 
                ? _cacheService.GetStatsCacheKey("kpis_mission")
                : _cacheService.GetStatsCacheKey("kpis");

            var stats = await _cacheService.GetOrSetAsync(
                cacheKey,
                async () =>
                {
                    if (mission_only == true)
                    {
                        return await _visitService.GetMissionStatsOnlyAsync();
                    }
                    return await _visitService.GetDashboardStatsAsync();
                },
                TimeSpan.FromMinutes(1) // Cache por 1 minuto
            );

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting KPIs");
            return StatusCode(500, new { error = "Error al obtener KPIs" });
        }
    }

    /// <summary>
    /// Obtener tendencia diaria de visitas
    /// GET /api/stats/daily?days=30
    /// </summary>
    [HttpGet("daily")]
    [ProducesResponseType(typeof(DailyTrendResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDailyTrend([FromQuery] int days = 30)
    {
        try
        {
            var endDate = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            var startDate = endDate.AddDays(-days);

            var visits = await _visitRepository.GetVisitsByDateRangeAsync(startDate, endDate);

            var grouped = visits
                .GroupBy(v => v.CreatedAt.Date)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .ToList();

            var response = new DailyTrendResponseDto
            {
                Dates = grouped.Select(x => x.Date).ToList(),
                Visits = grouped.Select(x => x.Count).ToList()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily trend");
            return StatusCode(500, new { error = "Error al obtener tendencia diaria" });
        }
    }

    /// <summary>
    /// Obtener estadísticas por departamento
    /// GET /api/stats/by-department
    /// </summary>
    [HttpGet("by-department")]
    [ProducesResponseType(typeof(List<DepartmentStatsResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatsByDepartment([FromQuery] DateTime? date_from = null, [FromQuery] DateTime? date_to = null)
    {
        try
        {
            var startDate = date_from ?? DateTime.UtcNow.Date.AddMonths(-1);
            var endDate = date_to ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

            var visits = await _visitRepository.GetVisitsByDateRangeAsync(startDate, endDate);

            var total = visits.Count();
            var grouped = visits
                .GroupBy(v => v.Department)
                .Select(g => new DepartmentStatsResponseDto
                {
                    Department = g.Key,
                    Visits = g.Count(),
                    Percentage = total > 0 ? Math.Round((g.Count() / (double)total) * 100, 2) : 0
                })
                .OrderByDescending(x => x.Visits)
                .ToList();

            return Ok(grouped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stats by department");
            return StatusCode(500, new { error = "Error al obtener estadísticas por departamento" });
        }
    }

    /// <summary>
    /// Obtener estadísticas de duración de visitas
    /// GET /api/stats/duration
    /// </summary>
    [HttpGet("duration")]
    [ProducesResponseType(typeof(DurationStatsResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDurationStats()
    {
        try
        {
            var closedVisits = await _visitRepository.GetVisitsByStatusAsync((int)Enums.VisitStatus.Cerrado);

            var durations = closedVisits
                .Where(v => v.EndAt.HasValue)
                .Select(v => (v.EndAt!.Value - v.CreatedAt).TotalMinutes)
                .Where(d => d > 0)
                .ToList();

            if (!durations.Any())
            {
                return Ok(new DurationStatsResponseDto
                {
                    Average = 0,
                    Min = 0,
                    Max = 0
                });
            }

            var stats = new DurationStatsResponseDto
            {
                Average = (int)durations.Average(),
                Min = (int)durations.Min(),
                Max = (int)durations.Max()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting duration stats");
            return StatusCode(500, new { error = "Error al obtener estadísticas de duración" });
        }
    }

    /// <summary>
    /// Obtener picos de visitas por hora
    /// GET /api/stats/hourly
    /// </summary>
    [HttpGet("hourly")]
    [ProducesResponseType(typeof(List<HourlyPeakDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHourlyPeaks([FromQuery] int days = 30)
    {
        try
        {
            var endDate = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            var startDate = endDate.AddDays(-days);

            var visits = await _visitRepository.GetVisitsByDateRangeAsync(startDate, endDate);

            var grouped = visits
                .GroupBy(v => v.CreatedAt.Hour)
                .Select(g => new HourlyPeakDto
                {
                    Hour = g.Key.ToString("D2"),
                    Label = $"{g.Key:D2}:00",
                    Visits = g.Count()
                })
                .OrderBy(x => x.Hour)
                .ToList();

            return Ok(grouped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hourly peaks");
            return StatusCode(500, new { error = "Error al obtener picos por hora" });
        }
    }

    /// <summary>
    /// Obtener promedio de visitas por día de la semana
    /// GET /api/stats/weekday-average
    /// </summary>
    [HttpGet("weekday-average")]
    [ProducesResponseType(typeof(List<WeekdayAverageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWeekdayAverage([FromQuery] int weeks = 4)
    {
        try
        {
            var endDate = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            var startDate = endDate.AddDays(-weeks * 7);

            var visits = await _visitRepository.GetVisitsByDateRangeAsync(startDate, endDate);

            var grouped = visits
                .GroupBy(v => v.CreatedAt.DayOfWeek)
                .Select(g => new WeekdayAverageDto
                {
                    Day = g.Key.ToString(),
                    Label = GetDayLabel(g.Key),
                    Average = g.Count() / weeks
                })
                .OrderBy(x => (int)Enum.Parse<DayOfWeek>(x.Day))
                .ToList();

            return Ok(grouped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting weekday average");
            return StatusCode(500, new { error = "Error al obtener promedio por día de la semana" });
        }
    }

    /// <summary>
    /// Comparar visitas semana actual vs semana anterior
    /// GET /api/stats/weekly-compare
    /// </summary>
    [HttpGet("weekly-compare")]
    [ProducesResponseType(typeof(List<WeeklyCompareDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWeeklyCompare()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var currentWeekStart = today.AddDays(-(int)today.DayOfWeek);
            var previousWeekStart = currentWeekStart.AddDays(-7);

            var currentWeekVisits = await _visitRepository.GetVisitsByDateRangeAsync(
                currentWeekStart, 
                today.AddDays(1).AddTicks(-1));

            var previousWeekVisits = await _visitRepository.GetVisitsByDateRangeAsync(
                previousWeekStart, 
                currentWeekStart.AddTicks(-1));

            var comparison = new List<WeeklyCompareDto>();

            for (int i = 0; i < 7; i++)
            {
                var dayOfWeek = (DayOfWeek)i;
                var current = currentWeekVisits.Count(v => v.CreatedAt.DayOfWeek == dayOfWeek);
                var previous = previousWeekVisits.Count(v => v.CreatedAt.DayOfWeek == dayOfWeek);
                var change = previous > 0 ? Math.Round(((current - previous) / (double)previous) * 100, 2) : 0;

                comparison.Add(new WeeklyCompareDto
                {
                    Day = dayOfWeek.ToString(),
                    Label = GetDayLabel(dayOfWeek),
                    Current = current,
                    Previous = previous,
                    Change = change
                });
            }

            return Ok(comparison);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting weekly compare");
            return StatusCode(500, new { error = "Error al comparar semanas" });
        }
    }

    /// <summary>
    /// Helper: Obtener etiqueta del día en español
    /// </summary>
    private static string GetDayLabel(DayOfWeek day)
    {
        return day switch
        {
            DayOfWeek.Sunday => "Domingo",
            DayOfWeek.Monday => "Lunes",
            DayOfWeek.Tuesday => "Martes",
            DayOfWeek.Wednesday => "Miércoles",
            DayOfWeek.Thursday => "Jueves",
            DayOfWeek.Friday => "Viernes",
            DayOfWeek.Saturday => "Sábado",
            _ => day.ToString()
        };
    }
}
