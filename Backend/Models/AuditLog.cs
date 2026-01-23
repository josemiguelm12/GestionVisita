using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad AuditLog - Registro de auditoría del sistema
/// Mapea la tabla 'audit_logs' de Laravel
/// Registra todas las acciones críticas del sistema para compliance y seguridad
/// </summary>
[Table("audit_logs")]
public class AuditLog : BaseEntity
{
    // FK: Usuario que realizó la acción (nullable para acciones anónimas)
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
    [Column(TypeName = "nvarchar(max)")]
    public string? OldValues { get; set; }

    /// <summary>
    /// Valores nuevos después del cambio (JSON)
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? NewValues { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? UserAgent { get; set; }

    [MaxLength(255)]
    public string? SessionId { get; set; }

    [MaxLength(10)]
    public string? RequestMethod { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? RequestUrl { get; set; }

    public int? StatusCode { get; set; }

    public int? DurationMs { get; set; }

    /// <summary>
    /// Metadata adicional (JSON)
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? Metadata { get; set; }

    [Required]
    public AuditSeverity Severity { get; set; } = AuditSeverity.Low;

    /// <summary>
    /// Tags para categorización (JSON array)
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? Tags { get; set; }

    #region Computed Properties

    /// <summary>
    /// Descripción legible de la acción
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
                "login" => "Iniciar sesión",
                "logout" => "Cerrar sesión",
                "export" => "Exportar",
                "import" => "Importar",
                "close_visit" => "Cerrar visita",
                "assign_carnet" => "Asignar carnet",
                "send_notification" => "Enviar notificación",
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
