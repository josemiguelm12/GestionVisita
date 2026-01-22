using System.ComponentModel.DataAnnotations;

namespace GestionVisitaAPI.DTOs.Visit;

public class CreateVisitRequestDto
{
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
    
    public bool MissionCase { get; set; } = false;
    
    [MaxLength(20)]
    [RegularExpression(@"^[A-Za-z0-9\-]+$", ErrorMessage = "Placa inválida")]
    public string? VehiclePlate { get; set; }
    
    [EmailAddress]
    public string? PersonToVisitEmail { get; set; }
    
    public bool SendEmail { get; set; } = false;
    
    public int? AssignedCarnet { get; set; }
    
    // Lista de IDs de visitantes a asociar
    public List<int>? VisitorIds { get; set; }
}

public class UpdateVisitRequestDto
{
    [MaxLength(255)]
    public string? NamePersonToVisit { get; set; }
    
    [MaxLength(255)]
    public string? Department { get; set; }
    
    public int? Building { get; set; }
    
    public int? Floor { get; set; }
    
    [MaxLength(500)]
    public string? Reason { get; set; }
    
    [MaxLength(20)]
    public string? VehiclePlate { get; set; }
    
    [EmailAddress]
    public string? PersonToVisitEmail { get; set; }
}

public class CloseVisitRequestDto
{
    [MaxLength(500)]
    public string? Observations { get; set; }
}

public class VisitResponseDto
{
    public int Id { get; set; }
    public string NamePersonToVisit { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int? Building { get; set; }
    public int? Floor { get; set; }
    public string? Reason { get; set; }
    public int StatusId { get; set; }
    public string? StatusName { get; set; }
    public bool MissionCase { get; set; }
    public string? VehiclePlate { get; set; }
    public string? PersonToVisitEmail { get; set; }
    public int? AssignedCarnet { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? EndAt { get; set; }
    public string? Duration { get; set; }
    public bool IsActive { get; set; }
    public string? CreatorName { get; set; }
    public string? CloserName { get; set; }
    public List<VisitorSummaryDto> Visitors { get; set; } = new();
}

public class VisitorSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? IdentityDocument { get; set; }
}
