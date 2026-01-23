namespace GestionVisitaAPI.Enums;

/// <summary>
/// Niveles de severidad para auditoría y logging
/// </summary>
public enum AuditSeverity
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

/// <summary>
/// Extensiones para AuditSeverity
/// </summary>
public static class AuditSeverityExtensions
{
    public static string GetLabel(this AuditSeverity severity)
    {
        return severity switch
        {
            AuditSeverity.Low => "Baja",
            AuditSeverity.Medium => "Media",
            AuditSeverity.High => "Alta",
            AuditSeverity.Critical => "Crítica",
            _ => "Desconocida"
        };
    }

    public static string GetColor(this AuditSeverity severity)
    {
        return severity switch
        {
            AuditSeverity.Critical => "red-600",
            AuditSeverity.High => "red-500",
            AuditSeverity.Medium => "yellow-500",
            AuditSeverity.Low => "green-500",
            _ => "gray-500"
        };
    }
}
