using System.ComponentModel.DataAnnotations;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.DTOs.Visitor;

public class CreateVisitorRequestDto
{
    public string? IdentityDocument { get; set; }
    
    [Required]
    public DocumentType DocumentType { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string LastName { get; set; } = string.Empty;
    
    [RegularExpression(@"^\d{3}-\d{3}-\d{4}$", ErrorMessage = "El teléfono debe tener el formato 000-000-0000")]
    public string? Phone { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    [MaxLength(255)]
    public string? Institution { get; set; }
}

public class UpdateVisitorRequestDto
{
    public string? IdentityDocument { get; set; }
    
    [Required]
    public DocumentType DocumentType { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string LastName { get; set; } = string.Empty;
    
    [RegularExpression(@"^\d{3}-\d{3}-\d{4}$", ErrorMessage = "El teléfono debe tener el formato 000-000-0000")]
    public string? Phone { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    [MaxLength(255)]
    public string? Institution { get; set; }
}

public class VisitorResponseDto
{
    public int Id { get; set; }
    public string? IdentityDocument { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Institution { get; set; }
    public DateTime CreatedAt { get; set; }
}
