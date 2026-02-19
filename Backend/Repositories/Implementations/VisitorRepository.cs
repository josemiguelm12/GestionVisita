using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Data;
using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;

namespace GestionVisitaAPI.Repositories.Implementations;

/// <summary>
/// Implementaci�n del repositorio de visitantes
/// </summary>
public class VisitorRepository : Repository<Visitor>, IVisitorRepository
{
    public VisitorRepository(ApplicationDbContext context) : base(context)
    {
    }

    // Sobrescribir para limitar resultados y optimizar
    public override async Task<IEnumerable<Visitor>> GetAllAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .OrderByDescending(v => v.CreatedAt)
            .Take(1000) // Limitar a 1000 visitantes más recientes
            .ToListAsync();
    }

    public async Task<Visitor?> GetByIdentityDocumentAsync(string identityDocument)
    {
        return await _dbSet
            .FirstOrDefaultAsync(v => v.IdentityDocument == identityDocument);
    }

    public async Task<IEnumerable<Visitor>> SearchVisitorsAsync(string searchTerm)
    {
        return await _dbSet
            .Where(v =>
                v.Name.Contains(searchTerm) ||
                v.LastName.Contains(searchTerm) ||
                (v.IdentityDocument != null && v.IdentityDocument.Contains(searchTerm)) ||
                (v.Email != null && v.Email.Contains(searchTerm)) ||
                (v.Institution != null && v.Institution.Contains(searchTerm))
            )
            .ToListAsync();
    }

    public async Task<IEnumerable<Visitor>> GetVisitorsWithActiveVisitsAsync()
    {
        return await _dbSet
            .Include(v => v.Visits.Where(visit => visit.StatusId == (int)Enums.VisitStatus.Abierto))
            .Where(v => v.Visits.Any(visit => visit.StatusId == (int)Enums.VisitStatus.Abierto))
            .ToListAsync();
    }

    public async Task<IEnumerable<Visitor>> GetFrequentVisitorsAsync(int minVisits = 5)
    {
        return await _dbSet
            .Include(v => v.Visits)
            .Where(v => v.Visits.Count >= minVisits)
            .OrderByDescending(v => v.Visits.Count)
            .ToListAsync();
    }

    public async Task<Visitor?> GetVisitorWithVisitsAsync(int id)
    {
        return await _dbSet
            .Include(v => v.Visits)
                .ThenInclude(visit => visit.Status)
            .Include(v => v.Creator)
            .FirstOrDefaultAsync(v => v.Id == id);
    }
}
