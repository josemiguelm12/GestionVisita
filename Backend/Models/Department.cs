using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad Department - Departamentos de la organización
/// </summary>
[Table("departments")]
public class Department : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    // Navegación: Visitas asociadas a este departamento
    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
