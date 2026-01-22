using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Tabla pivot para la relación muchos a muchos entre Visit y Visitor
/// Mapea la tabla 'visit_visitor' de Laravel
/// Incluye case_id para integración con sistema Sirenna (alertas)
/// </summary>
[Table("visit_visitor")]
public class VisitVisitor
{
    [Required]
    public int VisitId { get; set; }

    [ForeignKey(nameof(VisitId))]
    public virtual Visit Visit { get; set; } = null!;

    [Required]
    public int VisitorId { get; set; }

    [ForeignKey(nameof(VisitorId))]
    public virtual Visitor Visitor { get; set; } = null!;

    /// <summary>
    /// Case ID de sistema externo Sirenna (para integración con alertas)
    /// </summary>
    public int? CaseId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
