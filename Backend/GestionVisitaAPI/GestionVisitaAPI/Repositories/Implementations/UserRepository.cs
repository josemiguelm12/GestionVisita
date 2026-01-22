using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Data;
using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;

namespace GestionVisitaAPI.Repositories.Implementations;

/// <summary>
/// Implementación del repositorio de usuarios
/// </summary>
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByMicrosoftIdAsync(string microsoftId)
    {
        return await _dbSet
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.MicrosoftId == microsoftId);
    }

    public async Task<User?> GetUserWithRolesAsync(int id)
    {
        return await _dbSet
            .Include(u => u.Roles)
            .Include(u => u.Creator)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetActiveUsersAsync()
    {
        return await _dbSet
            .Include(u => u.Roles)
            .Where(u => u.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName)
    {
        return await _dbSet
            .Include(u => u.Roles)
            .Where(u => u.Roles.Any(r => r.Name == roleName))
            .ToListAsync();
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _dbSet.AnyAsync(u => u.Email == email);
    }

    public async Task AssignRoleAsync(int userId, int roleId)
    {
        var user = await _dbSet
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException($"Usuario con ID {userId} no encontrado");
        }

        var role = await _context.Set<Role>().FindAsync(roleId);

        if (role == null)
        {
            throw new InvalidOperationException($"Rol con ID {roleId} no encontrado");
        }

        // Verificar si ya tiene el rol
        if (!user.Roles.Any(r => r.Id == roleId))
        {
            user.Roles.Add(role);
            await _context.SaveChangesAsync();
        }
    }
}
