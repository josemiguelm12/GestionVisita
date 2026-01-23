using System.Security.Claims;
using GestionVisitaAPI.Enums;
using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;

namespace GestionVisitaAPI.Middleware;

/// <summary>
/// Middleware para auditoría automática de todas las peticiones HTTP
/// Registra acciones en la tabla audit_logs
/// </summary>
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditMiddleware> _logger;

    public AuditMiddleware(
        RequestDelegate next,
        ILogger<AuditMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IAuditLogRepository auditLogRepository)
    {
        var startTime = DateTime.UtcNow;
        var originalBodyStream = context.Response.Body;

        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);

            await LogAuditAsync(context, auditLogRepository, startTime, null);
        }
        catch (Exception ex)
        {
            await LogAuditAsync(context, auditLogRepository, startTime, ex);
            throw;
        }
        finally
        {
            // ? IMPORTANTE: Resetear la posición del stream antes de copiar
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }

    private async Task LogAuditAsync(
        HttpContext context,
        IAuditLogRepository auditLogRepository,
        DateTime startTime,
        Exception? exception)
    {
        try
        {
            // Solo auditar rutas específicas (no diagnostics, health, etc)
            if (ShouldAudit(context.Request.Path))
            {
                var userId = GetUserId(context);
                var action = DetermineAction(context);
                var resourceType = DetermineResourceType(context.Request.Path);

                var auditLog = new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    ResourceType = resourceType,
                    ResourceId = GetResourceId(context.Request.Path),
                    Metadata = BuildDetails(context, exception),
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = context.Request.Headers["User-Agent"].ToString(),
                    RequestMethod = context.Request.Method,
                    RequestUrl = context.Request.Path,
                    StatusCode = context.Response.StatusCode,
                    DurationMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds,
                    Severity = exception != null ? AuditSeverity.Critical :
                              context.Response.StatusCode >= 400 ? AuditSeverity.High :
                              AuditSeverity.Low,
                    CreatedAt = DateTime.UtcNow
                };

                await auditLogRepository.AddAsync(auditLog);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging audit entry");
        }
    }

    private bool ShouldAudit(PathString path)
    {
        var pathValue = path.Value?.ToLower() ?? "";
        return !pathValue.Contains("/diagnostics") &&
               !pathValue.Contains("/health") &&
               !pathValue.Contains("/swagger") &&
               !pathValue.Contains("/favicon");
    }

    private int? GetUserId(HttpContext context)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private string DetermineAction(HttpContext context)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? "";

        if (path.Contains("/login")) return "LOGIN";
        if (path.Contains("/logout")) return "LOGOUT";
        if (path.Contains("/close")) return "CLOSE_VISIT";
        if (path.Contains("/assign-carnet")) return "ASSIGN_CARNET";

        return method switch
        {
            "GET" => "VIEW",
            "POST" => "CREATE",
            "PUT" => "UPDATE",
            "PATCH" => "UPDATE",
            "DELETE" => "DELETE",
            _ => "UNKNOWN"
        };
    }

    private string DetermineResourceType(PathString path)
    {
        var pathValue = path.Value?.ToLower() ?? "";

        if (pathValue.Contains("/visit")) return "Visit";
        if (pathValue.Contains("/visitor")) return "Visitor";
        if (pathValue.Contains("/user")) return "User";
        if (pathValue.Contains("/auth")) return "Auth";
        if (pathValue.Contains("/stats")) return "Stats";

        return "Unknown";
    }

    private int? GetResourceId(PathString path)
    {
        var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments != null && segments.Length > 2)
        {
            if (int.TryParse(segments[^1], out var id))
                return id;
        }
        return null;
    }

    private string BuildDetails(HttpContext context, Exception? exception)
    {
        var details = new
        {
            method = context.Request.Method,
            path = context.Request.Path.Value,
            query = context.Request.QueryString.Value,
            statusCode = context.Response.StatusCode,
            error = exception?.Message
        };

        return System.Text.Json.JsonSerializer.Serialize(details);
    }
}
