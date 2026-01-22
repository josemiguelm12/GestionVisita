using GestionVisitaAPI.Models;

namespace GestionVisitaAPI.Repositories.Interfaces;

/// <summary>
/// Repositorio específico para Visitor
/// </summary>
public interface IVisitorRepository : IRepository<Visitor>
{
    Task<Visitor?> GetByIdentityDocumentAsync(string identityDocument);
    Task<IEnumerable<Visitor>> SearchVisitorsAsync(string searchTerm);
    Task<IEnumerable<Visitor>> GetVisitorsWithActiveVisitsAsync();
    Task<IEnumerable<Visitor>> GetFrequentVisitorsAsync(int minVisits = 5);
    Task<Visitor?> GetVisitorWithVisitsAsync(int id);
}
