namespace GestionVisitaAPI.Middleware;

/// <summary>
/// Middleware para logging detallado de todas las peticiones HTTP
/// Útil para debugging y monitoreo
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;
        var requestId = Guid.NewGuid().ToString("N")[..8];

        // Log request
        _logger.LogInformation(
            "[{RequestId}] {Method} {Path}{QueryString} - Started",
            requestId,
            context.Request.Method,
            context.Request.Path,
            context.Request.QueryString
        );

        try
        {
            await _next(context);
        }
        finally
        {
            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;

            // Log response
            _logger.LogInformation(
                "[{RequestId}] {Method} {Path} - {StatusCode} in {Duration}ms",
                requestId,
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                duration
            );
        }
    }
}
