using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad Visit - Visitas registradas en el sistema
/// Mapea la tabla 'visits' de Laravel
/// Gestiona el registro completo de visitas con sus estados y seguimiento
/// </summary>
[Table("visits")]
public class Visit : BaseEntity
{
    // FK: Usuario que creó la visita
    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? Creator { get; set; }

    // FK: Usuario que cerró la visita (nullable)
    public int? ClosedBy { get; set; }

    [ForeignKey(nameof(ClosedBy))]
    public virtual User? Closer { get; set; }

    [Required]
    [MaxLength(255)]
    public string NamePersonToVisit { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Department { get; set; } = string.Empty;

    public int? Building { get; set; }

    public int? Floor { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    // FK: Estado de la visita
    [Required]
    public int StatusId { get; set; }

    [ForeignKey(nameof(StatusId))]
    public virtual VisitStatusEntity? Status { get; set; }

    public DateTime? EndAt { get; set; }

    public int? AssignedCarnet { get; set; }

    public bool MissionCase { get; set; } = false;

    [MaxLength(20)]
    public string? VehiclePlate { get; set; }

    [MaxLength(255)]
    [EmailAddress]
    public string? PersonToVisitEmail { get; set; }

    public bool SendEmail { get; set; } = false;

    // Navegación: Relación muchos a muchos con Visitor
    public virtual ICollection<Visitor> Visitors { get; set; } = new List<Visitor>();

    // Navegación: Tabla pivot con información adicional
    public virtual ICollection<VisitVisitor> VisitVisitors { get; set; } = new List<VisitVisitor>();

    #region Computed Properties

    /// <summary>
    /// Verifica si la visita está activa (abierta)
    /// </summary>
    [NotMapped]
    public bool IsActive => StatusId == (int)Enums.VisitStatus.Abierto;

    /// <summary>
    /// Obtiene la duración de la visita (si está cerrada)
    /// </summary>
    [NotMapped]
    public TimeSpan? Duration
    {
        get
        {
            if (EndAt.HasValue)
            {
                return EndAt.Value - CreatedAt;
            }
            return null;
        }
    }

    /// <summary>
    /// Verifica si la visita es reciente (menos de 2 horas)
    /// </summary>
    [NotMapped]
    public bool IsRecent => CreatedAt > DateTime.UtcNow.AddHours(-2);

    #endregion
}
