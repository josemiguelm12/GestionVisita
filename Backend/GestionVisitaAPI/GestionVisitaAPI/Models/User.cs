using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionVisitaAPI.Models;

/// <summary>
/// Entidad User - Usuarios del sistema
/// Mapea la tabla 'users' de Laravel
/// Soporta autenticación JWT y SSO Microsoft 365
/// </summary>
[Table("users")]
public class User : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Password { get; set; }

    [MaxLength(255)]
    public string? MicrosoftId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime? EmailVerifiedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    // Auto-referencia: Usuario que creó este usuario
    public int? CreatedBy { get; set; }

    [ForeignKey(nameof(CreatedBy))]
    public virtual User? Creator { get; set; }

    // Navegación: Roles (muchos a muchos)
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    // Navegación: Usuarios creados por este usuario
    public virtual ICollection<User> CreatedUsers { get; set; } = new List<User>();

    // Navegación: Visitas creadas por este usuario
    public virtual ICollection<Visit> CreatedVisits { get; set; } = new List<Visit>();

    // Navegación: Visitas cerradas por este usuario
    public virtual ICollection<Visit> ClosedVisits { get; set; } = new List<Visit>();

    // Navegación: Visitantes creados por este usuario
    public virtual ICollection<Visitor> CreatedVisitors { get; set; } = new List<Visitor>();

    // Navegación: Logs de auditoría
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    #region Métodos de Helper

    /// <summary>
    /// Verifica si el usuario tiene un rol específico
    /// </summary>
    public bool HasRole(string roleName)
    {
        return Roles.Any(r => r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Verifica si el usuario es Admin
    /// </summary>
    [NotMapped]
    public bool IsAdmin => HasRole("Admin");

    /// <summary>
    /// Verifica si el usuario es Asistente Administrativo
    /// </summary>
    [NotMapped]
    public bool IsAsistAdm => HasRole("Asist_adm");

    /// <summary>
    /// Verifica si el usuario es Guardia
    /// </summary>
    [NotMapped]
    public bool IsGuardia => HasRole("Guardia");

    /// <summary>
    /// Verifica si el usuario es Auxiliar UGC
    /// </summary>
    [NotMapped]
    public bool IsAuxUgc => HasRole("aux_ugc");

    /// <summary>
    /// Obtiene el rol principal del usuario
    /// </summary>
    [NotMapped]
    public string? PrimaryRole => Roles.FirstOrDefault()?.Name;

    #endregion
}
