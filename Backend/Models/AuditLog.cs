using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad AuditLog - Registro de auditor�a del sistema
/// Mapea la tabla 'audit_logs' de Laravel
/// Registra todas las acciones cr�ticas del sistema para compliance y seguridad
/// </summary>
[Table("audit_logs")]
public class AuditLog : BaseEntity
{
    // FK: Usuario que realiz� la acci�n (nullable para acciones an�nimas)
    public int? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [Required]
    [MaxLength(255)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string ResourceType { get; set; } = string.Empty;

    public int? ResourceId { get; set; }

    /// <summary>
    /// Valores anteriores antes del cambio (JSON)
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// Valores nuevos despu�s del cambio (JSON)
    /// </summary>

    public string? NewValues { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    [MaxLength(255)]
    public string? SessionId { get; set; }

    [MaxLength(10)]
    public string? RequestMethod { get; set; }

    public string? RequestUrl { get; set; }

    public int? StatusCode { get; set; }

    public int? DurationMs { get; set; }

    /// <summary>
    /// Metadata adicional (JSON)
    /// </summary>
    public string? Metadata { get; set; }

    [Required]
    public AuditSeverity Severity { get; set; } = AuditSeverity.Low;

    /// <summary>
    /// Tags para categorizaci�n (JSON array)
    /// </summary>

    public string? Tags { get; set; }

    #region Computed Properties

    /// <summary>
    /// Descripci�n legible de la acci�n
    /// </summary>
    [NotMapped]
    public string ActionDescription
    {
        get
        {
            return Action switch
            {
                "create" => "Crear",
                "update" => "Actualizar",
                "delete" => "Eliminar",
                "view" => "Ver",
                "login" => "Iniciar sesi�n",
                "logout" => "Cerrar sesi�n",
                "export" => "Exportar",
                "import" => "Importar",
                "close_visit" => "Cerrar visita",
                "assign_carnet" => "Asignar carnet",
                "send_notification" => "Enviar notificaci�n",
                _ => Action
            };
        }
    }

    /// <summary>
    /// Color de severidad para UI
    /// </summary>
    [NotMapped]
    public string SeverityColor => Severity.GetColor();

    #endregion
}
