using GestionVisitaAPI.Models;

namespace GestionVisitaAPI.Repositories.Interfaces;

/// <summary>
/// Repositorio específico para User
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByMicrosoftIdAsync(string microsoftId);
    Task<User?> GetUserWithRolesAsync(int id);
    Task<IEnumerable<User>> GetActiveUsersAsync();
    Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName);
    Task<bool> EmailExistsAsync(string email);
    Task AssignRoleAsync(int userId, int roleId);
}
