using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad Role - Roles de usuario del sistema
/// Mapea la tabla 'roles' de Laravel
/// Roles: Admin, Asist_adm, Guardia, aux_ugc
/// </summary>
[Table("roles")]
public class Role : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    // Navegación: Relación muchos a muchos con User
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
