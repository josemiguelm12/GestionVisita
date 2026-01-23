using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad VisitStatusEntity - Estados de visitas (Abierto/Cerrado)
/// Mapea la tabla 'visit_statuses' de Laravel
/// NOTA: Se renombra a VisitStatusEntity para evitar conflicto con el enum VisitStatus
/// </summary>
[Table("visit_statuses")]
public class VisitStatusEntity : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    // Navegación: Visitas con este estado
    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
