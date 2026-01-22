namespace GestionVisitaAPI.Middleware;

/// <summary>
/// Middleware para monitoreo de performance
/// Alerta cuando las peticiones toman demasiado tiempo
/// </summary>
public class PerformanceMonitoringMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PerformanceMonitoringMiddleware> _logger;
    private const int WarningThresholdMs = 1000; // 1 segundo
    private const int CriticalThresholdMs = 3000; // 3 segundos

    public PerformanceMonitoringMiddleware(
        RequestDelegate next,
        ILogger<PerformanceMonitoringMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;

        await _next(context);

        var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;

        if (duration > CriticalThresholdMs)
        {
            _logger.LogWarning(
                "CRITICAL PERFORMANCE: {Method} {Path} took {Duration}ms",
                context.Request.Method,
                context.Request.Path,
                duration
            );
        }
        else if (duration > WarningThresholdMs)
        {
            _logger.LogWarning(
                "SLOW REQUEST: {Method} {Path} took {Duration}ms",
                context.Request.Method,
                context.Request.Path,
                duration
            );
        }

        // Add performance header
        context.Response.Headers["X-Response-Time-Ms"] = duration.ToString("0");
    }
}
