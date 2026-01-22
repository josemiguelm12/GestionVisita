using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Services;
using GestionVisitaAPI.DTOs.Visit;
using GestionVisitaAPI.Repositories.Interfaces;
using System.Security.Claims;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador de gestión de visitas
/// Mapea VisitController de Laravel
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
    /// Listar visitas con paginación y filtros
    /// GET /api/visit?page=1&per_page=15&search=...
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
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
        try
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

            return Ok(new
            {
                data = result.Data,
                pagination = new
                {
                    total = result.Total,
                    per_page,
                    current_page = page,
                    last_page = (int)Math.Ceiling(result.Total / (double)per_page)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visits");
            return StatusCode(500, new { error = "Error al obtener visitas" });
        }
    }

    /// <summary>
    /// Obtener visita por ID
    /// GET /api/visit/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
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

            return Ok(new { data = visit });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visit {VisitId}", id);
            return StatusCode(500, new { error = "Error al obtener la visita" });
        }
    }

    /// <summary>
    /// Obtener visitas activas
    /// GET /api/visit/active?q=...
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveVisits([FromQuery] string? q = null)
    {
        try
        {
            var visits = await _visitRepository.GetActiveVisitsAsync(q);
            return Ok(visits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active visits");
            return StatusCode(500, new { error = "Error al obtener visitas activas" });
        }
    }

    /// <summary>
    /// Obtener visitas activas misionales
    /// GET /api/visit/active/mission
    /// </summary>
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

    /// <summary>
    /// Obtener visitas activas no misionales
    /// GET /api/visit/active/non-mission
    /// </summary>
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

    /// <summary>
    /// Obtener visitas cerradas de hoy
    /// GET /api/visit/closed-today
    /// </summary>
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

    /// <summary>
    /// Obtener visitas de hoy
    /// GET /api/visit/today
    /// </summary>
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

    /// <summary>
    /// Crear nueva visita
    /// POST /api/visit
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateVisit([FromBody] CreateVisitRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return UnprocessableEntity(new
            {
                error = "Datos de entrada inválidos",
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

    /// <summary>
    /// Cerrar visita
    /// POST /api/visit/{id}/close
    /// </summary>
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

    /// <summary>
    /// Actualizar placa de vehículo
    /// PATCH /api/visit/{id}/vehicle-plate
    /// </summary>
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

    /// <summary>
    /// Asignar carnet
    /// POST /api/visit/{id}/assign-carnet
    /// </summary>
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

    /// <summary>
    /// Eliminar visita (soft delete)
    /// DELETE /api/visit/{id}
    /// </summary>
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

    /// <summary>
    /// Obtener estadísticas del dashboard
    /// GET /api/visit/stats/dashboard
    /// </summary>
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
            return StatusCode(500, new { error = "Error al obtener estadísticas" });
        }
    }

    /// <summary>
    /// Helper: Obtener ID del usuario autenticado
    /// </summary>
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

// DTOs auxiliares para endpoints específicos
public class UpdateVehiclePlateDto
{
    public string? VehiclePlate { get; set; }
}

public class AssignCarnetDto
{
    public int CarnetNumber { get; set; }
}
