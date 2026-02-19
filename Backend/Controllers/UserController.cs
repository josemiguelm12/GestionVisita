using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Data;
using GestionVisitaAPI.DTOs.User;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.Helpers;
using System.Security.Claims;

namespace GestionVisitaAPI.Controllers;

/// <summary>
/// Controlador para gestión de usuarios (solo Administradores)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserRepository userRepository,
        ApplicationDbContext context,
        ILogger<UserController> logger)
    {
        _userRepository = userRepository;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Listar todos los usuarios (solo Admin)
    /// GET /api/user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            // Verificar que el usuario actual es Admin
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
            {
                return Forbid();
            }

            var users = await _context.Users
                .Include(u => u.Roles)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            var usersDto = users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                Roles = u.Roles.Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description
                }).ToList()
            }).ToList();

            return Ok(new { data = usersDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { error = "Error al obtener usuarios" });
        }
    }

    /// <summary>
    /// Obtener usuario por ID (solo Admin)
    /// GET /api/user/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUser(int id)
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
            {
                return Forbid();
            }

            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { error = "Usuario no encontrado" });
            }

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt,
                Roles = user.Roles.Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description
                }).ToList()
            };

            return Ok(new { data = userDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, new { error = "Error al obtener usuario" });
        }
    }

    /// <summary>
    /// Crear nuevo usuario (solo Admin)
    /// POST /api/user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
            {
                return Forbid();
            }

            // Validar que el email no exista
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                return BadRequest(new { error = "El email ya está registrado" });
            }

            // Validar que los roles existan
            var roles = await _context.Roles
                .Where(r => request.RoleIds.Contains(r.Id))
                .ToListAsync();

            if (roles.Count != request.RoleIds.Count)
            {
                return BadRequest(new { error = "Uno o más roles no son válidos" });
            }

            // Crear usuario
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = new Models.User
            {
                Name = request.Name,
                Email = request.Email,
                Password = PasswordHelper.HashPassword(request.Password),
                IsActive = true,
                CreatedBy = currentUserId,
                Roles = roles
            };

            await _userRepository.AddAsync(user);

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt,
                Roles = user.Roles.Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description
                }).ToList()
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new { data = userDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { error = "Error al crear usuario" });
        }
    }

    /// <summary>
    /// Actualizar usuario (solo Admin)
    /// PUT /api/user/{id}
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
            {
                return Forbid();
            }

            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { error = "Usuario no encontrado" });
            }

            // Validar email único (excepto el mismo usuario)
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email && u.Id != id);

            if (emailExists)
            {
                return BadRequest(new { error = "El email ya está registrado" });
            }

            // Validar roles
            var roles = await _context.Roles
                .Where(r => request.RoleIds.Contains(r.Id))
                .ToListAsync();

            if (roles.Count != request.RoleIds.Count)
            {
                return BadRequest(new { error = "Uno o más roles no son válidos" });
            }

            // Actualizar usuario
            user.Name = request.Name;
            user.Email = request.Email;
            user.IsActive = request.IsActive;

            if (!string.IsNullOrEmpty(request.Password))
            {
                user.Password = PasswordHelper.HashPassword(request.Password);
            }

            // Actualizar roles
            user.Roles.Clear();
            user.Roles = roles;

            await _userRepository.UpdateAsync(user);

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt,
                Roles = user.Roles.Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description
                }).ToList()
            };

            return Ok(new { data = userDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { error = "Error al actualizar usuario" });
        }
    }

    /// <summary>
    /// Eliminar usuario (solo Admin)
    /// DELETE /api/user/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
            {
                return Forbid();
            }

            // No permitir eliminar al usuario actual
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (id == currentUserId)
            {
                return BadRequest(new { error = "No puedes eliminar tu propio usuario" });
            }

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "Usuario no encontrado" });
            }

            await _userRepository.DeleteAsync(id);

            return Ok(new { message = "Usuario eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { error = "Error al eliminar usuario" });
        }
    }

    /// <summary>
    /// Obtener todos los roles disponibles
    /// GET /api/user/roles
    /// </summary>
    [HttpGet("roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles()
    {
        try
        {
            var roles = await _context.Roles.ToListAsync();

            var rolesDto = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description
            }).ToList();

            return Ok(new { data = rolesDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            return StatusCode(500, new { error = "Error al obtener roles" });
        }
    }
}
