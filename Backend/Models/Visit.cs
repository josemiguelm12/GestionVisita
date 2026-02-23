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
    // FK: Usuario que cre� la visita
    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? Creator { get; set; }

    // FK: Usuario que cerr� la visita (nullable)
    public int? ClosedBy { get; set; }

    [ForeignKey(nameof(ClosedBy))]
    public virtual User? Closer { get; set; }

    [Required]
    [MaxLength(255)]
    public string NamePersonToVisit { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Department { get; set; } = string.Empty;

    // FK: Departamento
    public int? DepartmentId { get; set; }

    [ForeignKey(nameof(DepartmentId))]
    public virtual Department? DepartmentEntity { get; set; }

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

    // Navegaci�n: Relaci�n muchos a muchos con Visitor
    public virtual ICollection<Visitor> Visitors { get; set; } = new List<Visitor>();

    // Navegaci�n: Tabla pivot con informaci�n adicional
    public virtual ICollection<VisitVisitor> VisitVisitors { get; set; } = new List<VisitVisitor>();

    #region Computed Properties

    /// <summary>
    /// Verifica si la visita est� activa (abierta)
    /// </summary>
    [NotMapped]
    public bool IsActive => StatusId == (int)Enums.VisitStatus.Abierto;

    /// <summary>
    /// Obtiene la duraci�n de la visita (si est� cerrada)
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
