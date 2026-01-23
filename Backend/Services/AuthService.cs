using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.Helpers;
using GestionVisitaAPI.DTOs.Auth;

namespace GestionVisitaAPI.Services;

/// <summary>
/// Servicio de autenticación con JWT
/// Mapea AuthController de Laravel
/// </summary>
public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository,
        JwtHelper jwtHelper,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    /// <summary>
    /// Login con email y contraseña
    /// </summary>
    public async Task<(bool Success, LoginResponseDto? Response, string? Error)> LoginAsync(
        LoginRequestDto request, 
        string? ipAddress = null, 
        string? userAgent = null)
    {
        try
        {
            // 1. Buscar usuario por email
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                _logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
                
                // Log de seguridad
                await LogSecurityEvent("login_failed", null, "invalid_credentials", ipAddress, userAgent);
                
                return (false, null, "Credenciales inválidas");
            }

            // 2. Verificar contraseña
            if (string.IsNullOrEmpty(user.Password) || 
                !PasswordHelper.VerifyPassword(request.Password, user.Password))
            {
                _logger.LogWarning("Failed login attempt for user: {Email}", request.Email);
                
                await LogSecurityEvent("login_failed", user.Id, "invalid_password", ipAddress, userAgent);
                
                return (false, null, "Credenciales inválidas");
            }

            // 3. Verificar si el usuario está activo
            if (!user.IsActive)
            {
                _logger.LogWarning("Login attempt by inactive user: {Email}", request.Email);
                
                await LogSecurityEvent("login_failed", user.Id, "user_inactive", ipAddress, userAgent);
                
                return (false, null, "Usuario inactivo. Contacte al administrador.");
            }

            // 4. Cargar roles
            if (!user.Roles.Any())
            {
                user = await _userRepository.GetUserWithRolesAsync(user.Id);
            }

            var primaryRole = user?.Roles.FirstOrDefault();
            if (primaryRole == null)
            {
                _logger.LogError("User {UserId} has no role assigned", user?.Id);
                return (false, null, "Usuario sin rol asignado. Contacte al administrador.");
            }

            // 5. Generar token JWT
            var token = _jwtHelper.GenerateToken(user!);

            // 6. Actualizar última fecha de login
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // 7. Log de login exitoso
            _logger.LogInformation("User {Email} logged in successfully", user.Email);
            
            await LogSecurityEvent("login_success", user.Id, null, ipAddress, userAgent);

            // 8. Preparar respuesta
            var response = new LoginResponseDto
            {
                AccessToken = token,
                TokenType = "bearer",
                ExpiresIn = 3600, // 1 hora por defecto
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = primaryRole.Name,
                    RoleId = primaryRole.Id,
                    IsActive = user.IsActive,
                    Permissions = GetUserPermissions(primaryRole.Name)
                }
            };

            return (true, response, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", request.Email);
            return (false, null, "Error en el proceso de autenticación");
        }
    }

    /// <summary>
    /// Validar token JWT
    /// </summary>
    public async Task<(bool Valid, User? User)> ValidateTokenAsync(string token)
    {
        try
        {
            var userId = _jwtHelper.GetUserIdFromToken(token);
            if (userId == null)
            {
                return (false, null);
            }

            var user = await _userRepository.GetUserWithRolesAsync(userId.Value);
            if (user == null || !user.IsActive)
            {
                return (false, null);
            }

            return (true, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return (false, null);
        }
    }

    /// <summary>
    /// Obtener información del usuario autenticado
    /// </summary>
    public async Task<UserDto?> GetAuthenticatedUserAsync(int userId)
    {
        try
        {
            var user = await _userRepository.GetUserWithRolesAsync(userId);
            if (user == null)
            {
                return null;
            }

            var primaryRole = user.Roles.FirstOrDefault();

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = primaryRole?.Name,
                RoleId = primaryRole?.Id,
                IsActive = user.IsActive,
                Permissions = GetUserPermissions(primaryRole?.Name)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting authenticated user {UserId}", userId);
            return null;
        }
    }

    /// <summary>
    /// Logout (invalidar token - por ahora solo log)
    /// </summary>
    public async Task<bool> LogoutAsync(int userId, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            _logger.LogInformation("User {UserId} logged out", userId);
            
            await LogSecurityEvent("logout", userId, null, ipAddress, userAgent);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout for user {UserId}", userId);
            return false;
        }
    }

    /// <summary>
    /// Obtener permisos del usuario según su rol
    /// Mapea getUserPermissions de MicrosoftAuthController Laravel
    /// </summary>
    private List<string> GetUserPermissions(string? roleName)
    {
        if (string.IsNullOrEmpty(roleName))
        {
            return new List<string>();
        }

        var permissions = roleName switch
        {
            "Admin" => new List<string>
            {
                "manage_users",
                "manage_roles",
                "create_visits",
                "view_all_visits",
                "edit_visits",
                "delete_visits",
                "close_visits",
                "export_data",
                "view_reports",
                "manage_settings"
            },
            "Asist_adm" => new List<string>
            {
                "create_visits",
                "view_all_visits",
                "edit_visits",
                "close_visits",
                "export_data",
                "view_reports"
            },
            "Guardia" => new List<string>
            {
                "view_active_visits",
                "close_visits_restricted",
                "validate_qr",
                "register_vehicle_plate"
            },
            "aux_ugc" => new List<string>
            {
                "view_mission_visits",
                "close_mission_visits"
            },
            _ => new List<string>()
        };

        return permissions;
    }

    /// <summary>
    /// Registrar evento de seguridad
    /// </summary>
    private async Task LogSecurityEvent(
        string action, 
        int? userId, 
        string? details, 
        string? ipAddress, 
        string? userAgent)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = "auth",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Severity = action.Contains("failed") 
                    ? Enums.AuditSeverity.High 
                    : Enums.AuditSeverity.Medium,
                Metadata = details != null ? $"{{\"reason\":\"{details}\"}}" : null,
                Tags = action.Contains("failed") ? "[\"security\",\"failed_login\"]" : "[\"security\",\"authentication\"]"
            };

            await _auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security event");
        }
    }

    /// <summary>
    /// Registrar nuevo usuario
    /// </summary>
    public async Task<(bool Success, UserDto? User, string? Error)> RegisterAsync(
        RegisterRequestDto request,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            // 1. Verificar si el email ya existe
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return (false, null, "El email ya está registrado");
            }

            // 2. Hash de la contraseña
            var hashedPassword = PasswordHelper.HashPassword(request.Password);

            // 3. Crear el usuario
            var newUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = hashedPassword,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(newUser);

            // 4. Asignar rol
            await _userRepository.AssignRoleAsync(newUser.Id, request.RoleId);

            // 5. Cargar el usuario con roles
            var user = await _userRepository.GetUserWithRolesAsync(newUser.Id);
            var role = user?.Roles.FirstOrDefault();

            // 6. Log de registro
            _logger.LogInformation("New user registered: {Email}", request.Email);
            await LogSecurityEvent("user_registered", newUser.Id, null, ipAddress, userAgent);

            // 7. Preparar respuesta
            var userDto = new UserDto
            {
                Id = newUser.Id,
                Name = newUser.Name,
                Email = newUser.Email,
                Role = role?.Name,
                RoleId = role?.Id,
                IsActive = newUser.IsActive,
                Permissions = GetUserPermissions(role?.Name)
            };

            return (true, userDto, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return (false, null, "Error al registrar el usuario");
        }
    }
}
