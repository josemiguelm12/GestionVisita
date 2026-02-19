using System.ComponentModel.DataAnnotations;

namespace GestionVisitaAPI.DTOs.User;

/// <summary>
/// DTO para crear usuario
/// </summary>
public class CreateUserRequest
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe especificar al menos un rol")]
    public List<int> RoleIds { get; set; } = new();
}

/// <summary>
/// DTO para actualizar usuario
/// </summary>
public class UpdateUserRequest
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "Debe especificar al menos un rol")]
    public List<int> RoleIds { get; set; } = new();

    public bool IsActive { get; set; } = true;
}
