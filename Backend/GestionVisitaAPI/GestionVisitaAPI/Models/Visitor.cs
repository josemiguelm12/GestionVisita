using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad Visitor - Visitantes del sistema
/// Mapea la tabla 'visitors' de Laravel
/// Contiene información personal y de contacto de los visitantes
/// </summary>
[Table("visitors")]
public class Visitor : BaseEntity
{
    [MaxLength(255)]
    public string? IdentityDocument { get; set; }

    [Required]
    public DocumentType DocumentType { get; set; }

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(255)]
    public string? Institution { get; set; }

    // FK: Usuario que creó este visitante
    public int? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? Creator { get; set; }

    // Navegación: Relación muchos a muchos con Visit
    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();

    // Navegación: Tabla pivot con información adicional
    public virtual ICollection<VisitVisitor> VisitVisitors { get; set; } = new List<VisitVisitor>();

    #region Computed Properties

    /// <summary>
    /// Nombre completo del visitante
    /// </summary>
    [NotMapped]
    public string FullName => $"{Name} {LastName}".Trim();

    /// <summary>
    /// Label legible del tipo de documento
    /// </summary>
    [NotMapped]
    public string DocumentTypeLabel => DocumentType.GetLabel();

    #endregion
}
