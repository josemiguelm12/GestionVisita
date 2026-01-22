using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Services;
using GestionVisitaAPI.DTOs.Visitor;
using GestionVisitaAPI.Repositories.Interfaces;
using System.Security.Claims;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador de gestión de visitantes
/// Mapea VisitorController de Laravel
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VisitorController : ControllerBase
{
    private readonly VisitorService _visitorService;
    private readonly IVisitorRepository _visitorRepository;
    private readonly ILogger<VisitorController> _logger;

    public VisitorController(
        VisitorService visitorService,
        IVisitorRepository visitorRepository,
        ILogger<VisitorController> logger)
    {
        _visitorService = visitorService;
        _visitorRepository = visitorRepository;
        _logger = logger;
    }

    /// <summary>
    /// Listar todos los visitantes
    /// GET /api/visitor
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVisitors()
    {
        try
        {
            var visitors = await _visitorRepository.GetAllAsync();
            return Ok(visitors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visitors");
            return StatusCode(500, new { error = "Error al obtener visitantes" });
        }
    }

    /// <summary>
    /// Obtener visitante por ID
    /// GET /api/visitor/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisitor(int id)
    {
        try
        {
            var visitor = await _visitorRepository.GetVisitorWithVisitsAsync(id);
            
            if (visitor == null)
            {
                return NotFound(new { error = "Visitante no encontrado" });
            }

            return Ok(new { data = visitor });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visitor {VisitorId}", id);
            return StatusCode(500, new { error = "Error al obtener el visitante" });
        }
    }

    /// <summary>
    /// Buscar visitantes por término
    /// GET /api/visitor/search?q=...
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchVisitors([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { error = "El término de búsqueda es requerido" });
        }

        try
        {
            var visitors = await _visitorService.SearchVisitorsAsync(q);
            return Ok(visitors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching visitors with term: {SearchTerm}", q);
            return StatusCode(500, new { error = "Error al buscar visitantes" });
        }
    }

    /// <summary>
    /// Buscar visitante por documento de identidad
    /// GET /api/visitor/document/{document}
    /// </summary>
    [HttpGet("document/{document}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByDocument(string document)
    {
        try
        {
            var visitor = await _visitorService.GetByIdentityDocumentAsync(document);
            
            if (visitor == null)
            {
                return NotFound(new { error = "Visitante no encontrado" });
            }

            return Ok(new { data = visitor });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visitor by document {Document}", document);
            return StatusCode(500, new { error = "Error al buscar visitante" });
        }
    }

    /// <summary>
    /// Crear nuevo visitante
    /// POST /api/visitor
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateVisitor([FromBody] CreateVisitorRequestDto request)
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
            
            var result = await _visitorService.CreateVisitorAsync(request, userId);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return CreatedAtAction(
                nameof(GetVisitor),
                new { id = result.Visitor!.Id },
                new
                {
                    message = "Visitante creado exitosamente",
                    data = result.Visitor
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating visitor");
            return StatusCode(500, new { error = "Error al crear el visitante" });
        }
    }

    /// <summary>
    /// Actualizar visitante existente
    /// PUT /api/visitor/{id}
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateVisitor(int id, [FromBody] UpdateVisitorRequestDto request)
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
            var result = await _visitorService.UpdateVisitorAsync(id, request);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return Ok(new
            {
                message = "Visitante actualizado exitosamente",
                data = result.Visitor
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating visitor {VisitorId}", id);
            return StatusCode(500, new { error = "Error al actualizar el visitante" });
        }
    }

    /// <summary>
    /// Eliminar visitante
    /// DELETE /api/visitor/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteVisitor(int id)
    {
        try
        {
            var result = await _visitorService.DeleteVisitorAsync(id);

            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }

            return Ok(new { message = "Visitante eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting visitor {VisitorId}", id);
            return StatusCode(500, new { error = "Error al eliminar el visitante" });
        }
    }

    /// <summary>
    /// Obtener visitantes frecuentes
    /// GET /api/visitor/frequent?min=5
    /// </summary>
    [HttpGet("frequent")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFrequentVisitors([FromQuery] int min = 5)
    {
        try
        {
            var visitors = await _visitorRepository.GetFrequentVisitorsAsync(min);
            return Ok(visitors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting frequent visitors");
            return StatusCode(500, new { error = "Error al obtener visitantes frecuentes" });
        }
    }

    /// <summary>
    /// Obtener visitantes con visitas activas
    /// GET /api/visitor/with-active-visits
    /// </summary>
    [HttpGet("with-active-visits")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVisitorsWithActiveVisits()
    {
        try
        {
            var visitors = await _visitorRepository.GetVisitorsWithActiveVisitsAsync();
            return Ok(visitors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visitors with active visits");
            return StatusCode(500, new { error = "Error al obtener visitantes con visitas activas" });
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
