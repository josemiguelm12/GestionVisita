using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Services;
using GestionVisitaAPI.DTOs.Visit;
using GestionVisitaAPI.Repositories.Interfaces;
using System.Security.Claims;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador de gesti�n de visitas
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VisitController : ControllerBase
{
    private readonly VisitService _visitService;
    private readonly IVisitRepository _visitRepository;
    private readonly ILogger<VisitController> _logger;

    public VisitController(
        VisitService visitService,
        IVisitRepository visitRepository,
        ILogger<VisitController> logger)
    {
        _visitService = visitService;
        _visitRepository = visitRepository;
        _logger = logger;
    }

    /// <summary>
    /// Listar visitas con paginaci�n y filtros
    /// GET /api/visit?page=1&per_page=15&search=...
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVisits(
    [FromQuery] int page = 1,
    [FromQuery] int per_page = 15,
    [FromQuery] string? search = null,
    [FromQuery] int? status_id = null,
    [FromQuery] string? department = null,
    [FromQuery] DateTime? date_from = null,
    [FromQuery] DateTime? date_to = null,
    [FromQuery] bool? mission_case = null,
    [FromQuery] bool? has_vehicle = null)
    {
        var filters = new Dictionary<string, object>();

        if (!string.IsNullOrWhiteSpace(search)) filters["search"] = search;
        if (status_id.HasValue) filters["status_id"] = status_id.Value;
        if (!string.IsNullOrWhiteSpace(department)) filters["department"] = department;
        if (date_from.HasValue) filters["date_from"] = date_from.Value;
        if (date_to.HasValue) filters["date_to"] = date_to.Value;
        if (mission_case.HasValue) filters["mission_case"] = mission_case.Value;
        if (has_vehicle.HasValue) filters["has_vehicle"] = has_vehicle.Value;

        var result = await _visitRepository.GetVisitsPaginatedAsync(filters, page, per_page);

        var visitsDto = result.Data.Select(v => new VisitResponseDto
        {
            Id = v.Id,
            NamePersonToVisit = v.NamePersonToVisit,
            Department = v.Department,
            Building = v.Building,
            Floor = v.Floor,
            Reason = v.Reason,
            StatusId = v.StatusId,
            StatusName = v.Status?.Name,
            MissionCase = v.MissionCase,
            VehiclePlate = v.VehiclePlate,
            PersonToVisitEmail = v.PersonToVisitEmail,
            AssignedCarnet = v.AssignedCarnet,
            CreatedAt = v.CreatedAt,
            EndAt = v.EndAt,
            Duration = v.Duration != null
            ? v.Duration.Value.ToString(@"hh\:mm\:ss")
            : null,
            IsActive = v.IsActive,
            CreatorName = v.Creator?.Name,
            CloserName = v.Closer?.Name,
            Visitors = v.Visitors.Select(vis => new VisitorSummaryDto
            {
                Id = vis.Id,
                Name = vis.Name,
                LastName = vis.LastName,
                FullName = vis.FullName,
                IdentityDocument = vis.IdentityDocument
            }).ToList()
        }).ToList();

        return Ok(new
        {
            data = visitsDto,
            pagination = new
            {
                total = result.Total,
                per_page,
                current_page = page,
                last_page = (int)Math.Ceiling(result.Total / (double)per_page)
            }
        });
    }


    /// Obtener visita por ID
    /// GET /api/visit/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(VisitResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisit(int id)
    {
        try
        {
            var visit = await _visitRepository.GetVisitWithDetailsAsync(id);

            if (visit == null)
            {
                return NotFound(new { error = "Visita no encontrada" });
            }

            var response = new VisitResponseDto
            {
                Id = visit.Id,
                NamePersonToVisit = visit.NamePersonToVisit,
                Department = visit.Department,
                Building = visit.Building,
                Floor = visit.Floor,
                Reason = visit.Reason,
                StatusId = visit.StatusId,
                StatusName = visit.Status?.Name,
                MissionCase = visit.MissionCase,
                VehiclePlate = visit.VehiclePlate,
                PersonToVisitEmail = visit.PersonToVisitEmail,
                AssignedCarnet = visit.AssignedCarnet,
                CreatedAt = visit.CreatedAt,
                EndAt = visit.EndAt,
                Duration = visit.EndAt.HasValue
                    ? (visit.EndAt.Value - visit.CreatedAt).ToString(@"hh\:mm")
                    : null,
                IsActive = visit.IsActive,
                CreatorName = visit.Creator?.Name,
                CloserName = visit.Closer?.Name,
                Visitors = visit.Visitors.Select(v => new VisitorSummaryDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    LastName = v.LastName,
                    FullName = $"{v.Name} {v.LastName}",
                    IdentityDocument = v.IdentityDocument
                }).ToList()
            };

            return Ok(new { data = response });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visit {VisitId}", id);
            return StatusCode(500, new { error = "Error al obtener la visita" });
        }
    }



    /// Obtener visitas activas
    /// GET /api/visit/active?q=...
    [HttpGet("active")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveVisits([FromQuery] string? q = null)
    {
        try
        {
            var visits = await _visitRepository.GetActiveVisitsAsync(q);
            
            // Proyectar a DTOs para reducir el tamaño de la respuesta
            var visitsDto = visits.Select(v => new VisitResponseDto
            {
                Id = v.Id,
                NamePersonToVisit = v.NamePersonToVisit,
                Department = v.Department,
                Building = v.Building,
                Floor = v.Floor,
                Reason = v.Reason,
                StatusId = v.StatusId,
                StatusName = v.Status?.Name,
                MissionCase = v.MissionCase,
                VehiclePlate = v.VehiclePlate,
                PersonToVisitEmail = v.PersonToVisitEmail,
                AssignedCarnet = v.AssignedCarnet,
                CreatedAt = v.CreatedAt,
                EndAt = v.EndAt,
                Duration = v.Duration?.ToString(@"hh\:mm\:ss"),
                IsActive = v.IsActive,
                CreatorName = v.Creator?.Name,
                CloserName = v.Closer?.Name,
                Visitors = v.Visitors.Select(vis => new VisitorSummaryDto
                {
                    Id = vis.Id,
                    Name = vis.Name,
                    LastName = vis.LastName,
                    FullName = vis.FullName,
                    IdentityDocument = vis.IdentityDocument
                }).ToList()
            }).ToList();
            
            return Ok(new { data = visitsDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active visits");
            return StatusCode(500, new { error = "Error al obtener visitas activas" });
        }
    }

    /// Obtener visitas activas misionales
    /// GET /api/visit/active/mission
    [HttpGet("active/mission")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveMissionVisits([FromQuery] string? q = null)
    {
        try
        {
            var visits = await _visitRepository.GetActiveMissionVisitsAsync(q);
            return Ok(visits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active mission visits");
            return StatusCode(500, new { error = "Error al obtener visitas misionales activas" });
        }
    }

    /// Obtener visitas activas no misionales
    /// GET /api/visit/active/non-mission

    [HttpGet("active/non-mission")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveNonMissionVisits([FromQuery] string? q = null)
    {
        try
        {
            var visits = await _visitRepository.GetActiveNonMissionVisitsAsync(q);
            return Ok(visits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active non-mission visits");
            return StatusCode(500, new { error = "Error al obtener visitas no misionales activas" });
        }
    }

    /// Obtener visitas cerradas de hoy
    /// GET /api/visit/closed-today
 
    [HttpGet("closed-today")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClosedTodayVisits([FromQuery] string? q = null)
    {
        try
        {
            var visits = await _visitRepository.GetClosedTodayVisitsAsync(q);
            return Ok(visits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting closed today visits");
            return StatusCode(500, new { error = "Error al obtener visitas cerradas de hoy" });
        }
    }

    
    /// Obtener visitas de hoy
    /// GET /api/visit/today
    [HttpGet("today")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTodayVisits([FromQuery] string? q = null)
    {
        try
        {
            var visits = await _visitRepository.GetTodayVisitsAsync(q);
            return Ok(visits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting today visits");
            return StatusCode(500, new { error = "Error al obtener visitas de hoy" });
        }
    }


    /// Crear nueva visita
    /// POST /api/visit
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateVisit([FromBody] CreateVisitRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return UnprocessableEntity(new
            {
                error = "Datos de entrada inv�lidos",
                errors = ModelState
            });
        }

        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { error = "Usuario no autenticado" });
            }

            var result = await _visitService.CreateVisitAsync(request, userId.Value);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return CreatedAtAction(
                nameof(GetVisit),
                new { id = result.Visit!.Id },
                new
                {
                    message = "Visita creada exitosamente",
                    data = result.Visit
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating visit");
            return StatusCode(500, new { error = "Error al crear la visita" });
        }
    }


    /// Cerrar visita
    /// POST /api/visit/{id}/close
    [HttpPost("{id}/close")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CloseVisit(int id, [FromBody] CloseVisitRequestDto? request = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { error = "Usuario no autenticado" });
            }

            var result = await _visitService.CloseVisitAsync(id, userId.Value, request?.Observations);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return Ok(new
            {
                message = "Visita cerrada exitosamente",
                data = result.Visit
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing visit {VisitId}", id);
            return StatusCode(500, new { error = "Error al cerrar la visita" });
        }
    }


    /// Actualizar placa de veh�culo
    /// PATCH /api/visit/{id}/vehicle-plate
    [HttpPatch("{id}/vehicle-plate")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateVehiclePlate(int id, [FromBody] UpdateVehiclePlateDto request)
    {
        try
        {
            var result = await _visitService.UpdateVehiclePlateAsync(id, request.VehiclePlate);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return Ok(new
            {
                message = "Placa actualizada exitosamente",
                data = result.Visit
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating vehicle plate for visit {VisitId}", id);
            return StatusCode(500, new { error = "Error al actualizar la placa" });
        }
    }

    /// Asignar carnet
    /// POST /api/visit/{id}/assign-carnet
    [HttpPost("{id}/assign-carnet")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> AssignCarnet(int id, [FromBody] AssignCarnetDto request)
    {
        try
        {
            var result = await _visitService.AssignCarnetAsync(id, request.CarnetNumber);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return Ok(new
            {
                message = "Carnet asignado exitosamente",
                data = result.Visit
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning carnet to visit {VisitId}", id);
            return StatusCode(500, new { error = "Error al asignar el carnet" });
        }
    }


    /// Eliminar visita (soft delete)
    /// DELETE /api/visit/{id}
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVisit(int id)
    {
        try
        {
            await _visitRepository.DeleteAsync(id);

            return Ok(new { message = "Visita eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting visit {VisitId}", id);
            return StatusCode(500, new { error = "Error al eliminar la visita" });
        }
    }


    /// Obtener estad�sticas del dashboard
    /// GET /api/visit/stats/dashboard
    [HttpGet("stats/dashboard")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var stats = await _visitService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, new { error = "Error al obtener estad�sticas" });
        }
    }


    /// Helper: Obtener ID del usuario autenticado
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }
}

// DTOs auxiliares para endpoints espec�ficos
public class UpdateVehiclePlateDto
{
    public string? VehiclePlate { get; set; }
}

public class AssignCarnetDto
{
    public int CarnetNumber { get; set; }
}
