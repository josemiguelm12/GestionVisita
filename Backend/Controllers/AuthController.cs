using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Services;
using GestionVisitaAPI.DTOs.Auth;

namespace GestionVisitaAPI.Controllers;

/// Controlador de autenticaci�n con JWT
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AuthService authService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// Login con email y contrase�a
    /// POST /api/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return UnprocessableEntity(new
            {
                error = "Datos de entrada inv�lidos",
                errors = ModelState
            });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(request, ipAddress, userAgent);

        if (!result.Success)
        {
            return Unauthorized(new { error = result.Error });
        }

        return Ok(result.Response);
    }


    /// Obtener informaci�n del usuario autenticado
    /// GET /api/auth/me
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAuthenticatedUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Token inv�lido" });
            }

            var user = await _authService.GetAuthenticatedUserAsync(userId);
            
            if (user == null)
            {
                return Unauthorized(new { error = "Usuario no encontrado" });
            }

            return Ok(new { user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting authenticated user");
            return StatusCode(500, new { error = "Error al obtener informaci�n del usuario" });
        }
    }


    /// Cerrar sesi�n
    /// POST /api/auth/logout
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = HttpContext.Request.Headers.UserAgent.ToString();
                
                await _authService.LogoutAsync(userId, ipAddress, userAgent);
            }

            return Ok(new { message = "Sesi�n cerrada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return Ok(new { message = "Sesi�n cerrada" });
        }
    }


    /// Verificar validez del token (health check)
    /// GET /api/auth/check
    [HttpGet("check")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult CheckToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email);

        if (userIdClaim == null || emailClaim == null)
        {
            return Unauthorized(new { valid = false });
        }

        return Ok(new
        {
            valid = true,
            userId = userIdClaim.Value,
            email = emailClaim.Value
        });
    }


    /// Registro de nuevo usuario
    /// POST /api/auth/register
    /// ?? TEMPORAL: Solo para testing. En producci�n debe estar protegido o deshabilitado.
    [HttpPost("register")]
    [AllowAnonymous] // ?? CAMBIAR A [Authorize(Roles = "Admin")] en producci�n
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return UnprocessableEntity(new
            {
                error = "Datos de entrada inv�lidos",
                errors = ModelState
            });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var (success, user, error) = await _authService.RegisterAsync(request, ipAddress, userAgent);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return CreatedAtAction(nameof(GetAuthenticatedUser), new { }, new
        {
            message = "Usuario registrado exitosamente",
            user
        });
    }
}
