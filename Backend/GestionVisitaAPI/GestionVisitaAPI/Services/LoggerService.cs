using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Services;

/// <summary>
/// Servicio de logging estructurado con auditoría
/// Mapea LoggerService de Laravel
/// </summary>
public class LoggerService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<LoggerService> _logger;

    public LoggerService(
        IAuditLogRepository auditLogRepository,
        ILogger<LoggerService> logger)
    {
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    /// <summary>
    /// Log de visita (crear, cerrar, actualizar)
    /// Mapea logVisit de LoggerService Laravel
    /// </summary>
    public async Task LogVisitAsync(
        string action, 
        int? visitId, 
        int? userId,
        Dictionary<string, object>? metadata = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            var severity = action switch
            {
                "created" => AuditSeverity.Medium,
                "closed" => AuditSeverity.Medium,
                "deleted" => AuditSeverity.High,
                _ => AuditSeverity.Low
            };

            var tags = new List<string> { "visit", action };
            if (action == "deleted") tags.Add("data_deletion");

            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = "visit",
                ResourceId = visitId,
                Metadata = metadata != null 
                    ? System.Text.Json.JsonSerializer.Serialize(metadata) 
                    : null,
                Severity = severity,
                Tags = System.Text.Json.JsonSerializer.Serialize(tags),
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            await _auditLogRepository.AddAsync(auditLog);

            _logger.LogInformation(
                "Visit action logged: {Action} for visit {VisitId} by user {UserId}",
                action, visitId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging visit action");
        }
    }

    /// <summary>
    /// Log de seguridad (login, logout, accesos no autorizados)
    /// Mapea logSecurity de LoggerService Laravel
    /// </summary>
    public async Task LogSecurityAsync(
        string action, 
        int? userId,
        string? details = null,
        AuditSeverity severity = AuditSeverity.Medium,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            var tags = new List<string> { "security", action };
            
            if (action.Contains("failed") || action.Contains("unauthorized"))
            {
                tags.Add("security_incident");
                severity = AuditSeverity.High;
            }

            var metadata = details != null 
                ? new Dictionary<string, object> { { "details", details } }
                : null;

            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = "security",
                Metadata = metadata != null 
                    ? System.Text.Json.JsonSerializer.Serialize(metadata) 
                    : null,
                Severity = severity,
                Tags = System.Text.Json.JsonSerializer.Serialize(tags),
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            await _auditLogRepository.AddAsync(auditLog);

            if (severity >= AuditSeverity.High)
            {
                _logger.LogWarning(
                    "Security event: {Action} - User: {UserId} - IP: {IP}",
                    action, userId, ipAddress);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security event");
        }
    }

    /// <summary>
    /// Log de negocio (acciones importantes del sistema)
    /// Mapea logBusiness de LoggerService Laravel
    /// </summary>
    public async Task LogBusinessAsync(
        string action, 
        int? userId,
        Dictionary<string, object>? metadata = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = "business",
                Metadata = metadata != null 
                    ? System.Text.Json.JsonSerializer.Serialize(metadata) 
                    : null,
                Severity = AuditSeverity.Low,
                Tags = System.Text.Json.JsonSerializer.Serialize(new[] { "business", action })
            };

            await _auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging business event");
        }
    }

    /// <summary>
    /// Log de exportación (Excel, PDF)
    /// Mapea logExport de LoggerService Laravel
    /// </summary>
    public async Task LogExportAsync(
        string format, 
        int? userId,
        int recordCount,
        Dictionary<string, object>? filters = null)
    {
        try
        {
            var metadata = new Dictionary<string, object>
            {
                { "format", format },
                { "record_count", recordCount }
            };

            if (filters != null)
            {
                metadata["filters"] = filters;
            }

            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = $"export_{format}",
                ResourceType = "export",
                Metadata = System.Text.Json.JsonSerializer.Serialize(metadata),
                Severity = AuditSeverity.Low,
                Tags = System.Text.Json.JsonSerializer.Serialize(new[] { "export", format })
            };

            await _auditLogRepository.AddAsync(auditLog);

            _logger.LogInformation(
                "Export generated: {Format} with {Count} records by user {UserId}",
                format, recordCount, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging export event");
        }
    }

    /// <summary>
    /// Log de cambios de datos (create, update, delete)
    /// Mapea logDataChange de LoggerService Laravel
    /// </summary>
    public async Task LogDataChangeAsync(
        string action,
        string resourceType,
        int? resourceId,
        int? userId,
        object? oldValues = null,
        object? newValues = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            var severity = action switch
            {
                "delete" => AuditSeverity.High,
                "create" => AuditSeverity.Medium,
                "update" => AuditSeverity.Low,
                _ => AuditSeverity.Low
            };

            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = resourceType,
                ResourceId = resourceId,
                OldValues = oldValues != null 
                    ? System.Text.Json.JsonSerializer.Serialize(oldValues) 
                    : null,
                NewValues = newValues != null 
                    ? System.Text.Json.JsonSerializer.Serialize(newValues) 
                    : null,
                Severity = severity,
                Tags = System.Text.Json.JsonSerializer.Serialize(new[] { "data_change", action }),
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            await _auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging data change");
        }
    }

    /// <summary>
    /// Log de métrica (para monitoreo y análisis)
    /// </summary>
    public async Task LogMetricAsync(
        string metricName,
        double value,
        Dictionary<string, object>? tags = null)
    {
        try
        {
            var metadata = new Dictionary<string, object>
            {
                { "metric_name", metricName },
                { "value", value }
            };

            if (tags != null)
            {
                metadata["tags"] = tags;
            }

            var auditLog = new AuditLog
            {
                Action = "metric",
                ResourceType = "metric",
                Metadata = System.Text.Json.JsonSerializer.Serialize(metadata),
                Severity = AuditSeverity.Low,
                Tags = System.Text.Json.JsonSerializer.Serialize(new[] { "metric", metricName })
            };

            await _auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging metric");
        }
    }

    /// <summary>
    /// Obtener logs por usuario
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetLogsByUserAsync(int userId, int limit = 100)
    {
        try
        {
            var logs = await _auditLogRepository.GetLogsByUserAsync(userId);
            return logs.Take(limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting logs by user {UserId}", userId);
            return Enumerable.Empty<AuditLog>();
        }
    }

    /// <summary>
    /// Obtener incidentes de seguridad
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetSecurityIncidentsAsync(int limit = 50)
    {
        try
        {
            var incidents = await _auditLogRepository.GetSecurityIncidentsAsync();
            return incidents.Take(limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security incidents");
            return Enumerable.Empty<AuditLog>();
        }
    }

    /// <summary>
    /// Obtener logs por rango de fechas
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetLogsByDateRangeAsync(
        DateTime startDate, 
        DateTime endDate,
        int limit = 1000)
    {
        try
        {
            var logs = await _auditLogRepository.GetLogsByDateRangeAsync(startDate, endDate);
            return logs.Take(limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting logs by date range");
            return Enumerable.Empty<AuditLog>();
        }
    }
}
