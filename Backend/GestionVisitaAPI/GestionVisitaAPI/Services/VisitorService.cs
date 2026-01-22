using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.DTOs.Visitor;
using GestionVisitaAPI.Enums;

namespace GestionVisitaAPI.Services;

/// <summary>
/// Servicio de lógica de negocio para visitantes
/// Mapea VisitorController de Laravel
/// </summary>
public class VisitorService
{
    private readonly IVisitorRepository _visitorRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<VisitorService> _logger;

    public VisitorService(
        IVisitorRepository visitorRepository,
        IAuditLogRepository auditLogRepository,
        ILogger<VisitorService> logger)
    {
        _visitorRepository = visitorRepository;
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    /// <summary>
    /// Crear un nuevo visitante
    /// Mapea store de VisitorController Laravel
    /// </summary>
    public async Task<(bool Success, Visitor? Visitor, string? Error)> CreateVisitorAsync(
        CreateVisitorRequestDto request, 
        int? createdByUserId = null)
    {
        try
        {
            // 1. Validar que el documento no exista (si no es "Sin Identificación")
            if (request.DocumentType != DocumentType.SinIdentificacion && 
                !string.IsNullOrWhiteSpace(request.IdentityDocument))
            {
                var existing = await _visitorRepository.GetByIdentityDocumentAsync(request.IdentityDocument);
                if (existing != null)
                {
                    return (false, null, "Ya existe un visitante con ese documento de identidad");
                }
            }

            // 2. Si es "Sin Identificación", el documento debe ser null
            var identityDocument = request.DocumentType == DocumentType.SinIdentificacion 
                ? null 
                : request.IdentityDocument;

            // 3. Crear el visitante
            var visitor = new Visitor
            {
                IdentityDocument = identityDocument,
                DocumentType = request.DocumentType,
                Name = request.Name,
                LastName = request.LastName,
                Phone = request.Phone,
                Email = request.Email?.ToLower(),
                Institution = request.Institution,
                UserId = createdByUserId
            };

            var createdVisitor = await _visitorRepository.AddAsync(visitor);

            // 4. Log de auditoría
            await LogVisitorAction("create", createdVisitor.Id, createdByUserId, new
            {
                document_type = request.DocumentType,
                has_phone = !string.IsNullOrEmpty(request.Phone),
                has_email = !string.IsNullOrEmpty(request.Email)
            });

            _logger.LogInformation(
                "Visitor {VisitorId} created: {Name} {LastName}",
                createdVisitor.Id, createdVisitor.Name, createdVisitor.LastName);

            return (true, createdVisitor, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating visitor");
            return (false, null, "Error al crear el visitante");
        }
    }

    /// <summary>
    /// Actualizar un visitante existente
    /// Mapea update de VisitorController Laravel
    /// </summary>
    public async Task<(bool Success, Visitor? Visitor, string? Error)> UpdateVisitorAsync(
        int visitorId, 
        UpdateVisitorRequestDto request)
    {
        try
        {
            // 1. Obtener el visitante
            var visitor = await _visitorRepository.GetByIdAsync(visitorId);
            if (visitor == null)
            {
                return (false, null, "Visitante no encontrado");
            }

            // 2. Validar documento único (excepto el actual)
            if (request.DocumentType != DocumentType.SinIdentificacion && 
                !string.IsNullOrWhiteSpace(request.IdentityDocument))
            {
                var existing = await _visitorRepository.GetByIdentityDocumentAsync(request.IdentityDocument);
                if (existing != null && existing.Id != visitorId)
                {
                    return (false, null, "Ya existe otro visitante con ese documento de identidad");
                }
            }

            // 3. Actualizar datos
            var oldValues = new
            {
                identity_document = visitor.IdentityDocument,
                document_type = visitor.DocumentType,
                name = visitor.Name,
                last_name = visitor.LastName,
                phone = visitor.Phone,
                email = visitor.Email,
                institution = visitor.Institution
            };

            visitor.IdentityDocument = request.DocumentType == DocumentType.SinIdentificacion 
                ? null 
                : request.IdentityDocument;
            visitor.DocumentType = request.DocumentType;
            visitor.Name = request.Name;
            visitor.LastName = request.LastName;
            visitor.Phone = request.Phone;
            visitor.Email = request.Email?.ToLower();
            visitor.Institution = request.Institution;

            var updatedVisitor = await _visitorRepository.UpdateAsync(visitor);

            // 4. Log de auditoría
            await LogVisitorAction("update", visitorId, null, new
            {
                old_values = oldValues,
                changes = new
                {
                    document_changed = oldValues.identity_document != visitor.IdentityDocument,
                    email_changed = oldValues.email != visitor.Email,
                    phone_changed = oldValues.phone != visitor.Phone
                }
            });

            _logger.LogInformation("Visitor {VisitorId} updated", visitorId);

            return (true, updatedVisitor, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating visitor {VisitorId}", visitorId);
            return (false, null, "Error al actualizar el visitante");
        }
    }

    /// <summary>
    /// Buscar visitante por documento de identidad
    /// Mapea search de VisitorController Laravel
    /// </summary>
    public async Task<Visitor?> GetByIdentityDocumentAsync(string identityDocument)
    {
        try
        {
            return await _visitorRepository.GetByIdentityDocumentAsync(identityDocument);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching visitor by document {Document}", identityDocument);
            return null;
        }
    }

    /// <summary>
    /// Obtener o crear visitante (si no existe)
    /// Útil para el flujo de creación de visitas
    /// </summary>
    public async Task<(bool Success, Visitor? Visitor, bool Created, string? Error)> GetOrCreateVisitorAsync(
        CreateVisitorRequestDto request, 
        int? createdByUserId = null)
    {
        try
        {
            // 1. Si tiene documento, intentar buscar primero
            if (request.DocumentType != DocumentType.SinIdentificacion && 
                !string.IsNullOrWhiteSpace(request.IdentityDocument))
            {
                var existing = await _visitorRepository.GetByIdentityDocumentAsync(request.IdentityDocument);
                if (existing != null)
                {
                    _logger.LogInformation(
                        "Visitor found by document: {Document}", 
                        request.IdentityDocument);
                    
                    return (true, existing, false, null);
                }
            }

            // 2. Si no existe, crear nuevo
            var result = await CreateVisitorAsync(request, createdByUserId);
            
            if (result.Success)
            {
                return (true, result.Visitor, true, null);
            }
            else
            {
                return (false, null, false, result.Error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetOrCreateVisitor");
            return (false, null, false, "Error al obtener o crear el visitante");
        }
    }

    /// <summary>
    /// Eliminar un visitante
    /// Mapea destroy de VisitorController Laravel
    /// </summary>
    public async Task<(bool Success, string? Error)> DeleteVisitorAsync(int visitorId)
    {
        try
        {
            var visitor = await _visitorRepository.GetVisitorWithVisitsAsync(visitorId);
            
            if (visitor == null)
            {
                return (false, "Visitante no encontrado");
            }

            // Verificar si tiene visitas activas
            var hasActiveVisits = visitor.Visits.Any(v => v.StatusId == (int)Enums.VisitStatus.Abierto);
            if (hasActiveVisits)
            {
                return (false, "No se puede eliminar un visitante con visitas activas");
            }

            // Log antes de eliminar
            await LogVisitorAction("delete", visitorId, null, new
            {
                name = visitor.FullName,
                total_visits = visitor.Visits.Count
            });

            await _visitorRepository.DeleteAsync(visitorId);

            _logger.LogInformation("Visitor {VisitorId} deleted", visitorId);

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting visitor {VisitorId}", visitorId);
            return (false, "Error al eliminar el visitante");
        }
    }

    /// <summary>
    /// Buscar visitantes por término de búsqueda
    /// </summary>
    public async Task<IEnumerable<Visitor>> SearchVisitorsAsync(string searchTerm)
    {
        try
        {
            return await _visitorRepository.SearchVisitorsAsync(searchTerm);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching visitors with term: {SearchTerm}", searchTerm);
            return Enumerable.Empty<Visitor>();
        }
    }

    /// <summary>
    /// Registrar acción de visitante en audit log
    /// </summary>
    private async Task LogVisitorAction(string action, int visitorId, int? userId, object metadata)
    {
        try
        {
            var severity = action switch
            {
                "create" => AuditSeverity.Medium,
                "update" => AuditSeverity.Medium,
                "delete" => AuditSeverity.High,
                _ => AuditSeverity.Low
            };

            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = "visitor",
                ResourceId = visitorId,
                Metadata = System.Text.Json.JsonSerializer.Serialize(metadata),
                Severity = severity,
                Tags = $"[\"visitor\",\"{action}\",\"personal_data\"]"
            };

            await _auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging visitor action");
        }
    }
}
