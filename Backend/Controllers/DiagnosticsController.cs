using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Data;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador de diagnóstico y health checks
/// Para monitoreo de la aplicación
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DiagnosticsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<DiagnosticsController> _logger;

    public DiagnosticsController(
        ApplicationDbContext dbContext,
        ILogger<DiagnosticsController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Health check básico
    /// GET /api/diagnostics/health
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> HealthCheck()
    {
        try
        {
            // Verificar conexión a base de datos
            var canConnect = await _dbContext.Database.CanConnectAsync();

            if (!canConnect)
            {
                return StatusCode(503, new
                {
                    status = "unhealthy",
                    database = "disconnected"
                });
            }

            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                database = "connected",
                version = "1.0.0"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(503, new
            {
                status = "unhealthy",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Estado detallado del sistema
    /// GET /api/diagnostics/status
    /// </summary>
    [HttpGet("status")]
    [Authorize] // Solo usuarios autenticados
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus()
    {
        try
        {
            var canConnect = await _dbContext.Database.CanConnectAsync();

            var status = new
            {
                application = new
                {
                    name = "Gestión de Visitas API",
                    version = "1.0.0",
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    framework = "ASP.NET 10"
                },
                database = new
                {
                    connected = canConnect,
                    provider = "SQL Server"
                },
                server = new
                {
                    machineName = Environment.MachineName,
                    osVersion = Environment.OSVersion.ToString(),
                    processorCount = Environment.ProcessorCount,
                    uptime = GetUptime()
                },
                timestamp = DateTime.UtcNow
            };

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system status");
            return StatusCode(500, new { error = "Error al obtener el estado del sistema" });
        }
    }

    /// <summary>
    /// Información de la API
    /// GET /api/diagnostics/info
    /// </summary>
    [HttpGet("info")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetInfo()
    {
        return Ok(new
        {
            name = "Gestión de Visitas API",
            version = "1.0.0",
            description = "API REST para gestión de visitas institucionales",
            documentation = "/swagger",
            endpoints = new
            {
                auth = "/api/auth",
                visits = "/api/visit",
                visitors = "/api/visitor",
                stats = "/api/stats",
                diagnostics = "/api/diagnostics"
            }
        });
    }

    /// <summary>
    /// Ping simple para verificar disponibilidad
    /// GET /api/diagnostics/ping
    /// </summary>
    [HttpGet("ping")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Ping()
    {
        return Ok(new
        {
            message = "pong",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Helper: Obtener uptime del proceso
    /// </summary>
    private static string GetUptime()
    {
        var uptime = DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime();
        return $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m {uptime.Seconds}s";
    }
}
