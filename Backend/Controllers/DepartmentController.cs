using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Data;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador de departamentos
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Listar todos los departamentos activos
    /// GET /api/department
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departments = await _context.Departments
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Description
            })
            .ToListAsync();

        return Ok(departments);
    }
}
