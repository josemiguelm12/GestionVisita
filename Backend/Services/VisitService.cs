using GestionVisitaAPI.Models;
using GestionVisitaAPI.Repositories.Interfaces;
using GestionVisitaAPI.DTOs.Visit;
using GestionVisitaAPI.DTOs.Stats;
using GestionVisitaAPI.Enums;
using Microsoft.EntityFrameworkCore;

namespace GestionVisitaAPI.Services;

/// <summary>
/// Servicio de l�gica de negocio para visitas
/// Mapea VisitService de Laravel
/// </summary>
public class VisitService
{
    private readonly IVisitRepository _visitRepository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<VisitService> _logger;

    public VisitService(
        IVisitRepository visitRepository,
        IVisitorRepository visitorRepository,
        IAuditLogRepository auditLogRepository,
        ILogger<VisitService> logger)
    {
        _visitRepository = visitRepository;
        _visitorRepository = visitorRepository;
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    /// <summary>
    /// Crear una nueva visita con visitantes
    /// Mapea createVisit de VisitService Laravel
    /// </summary>
    public async Task<(bool Success, Visit? Visit, string? Error)> CreateVisitAsync(
        CreateVisitRequestDto request, 
        int createdByUserId)
    {
        try
        {
            // 1. Crear la visita
            var visit = new Visit
            {
                UserId = createdByUserId,
                NamePersonToVisit = request.NamePersonToVisit,
                Department = request.Department,
                Building = request.Building,
                Floor = request.Floor,
                Reason = request.Reason,
                StatusId = (int)Enums.VisitStatus.Abierto,
                MissionCase = request.MissionCase,
                VehiclePlate = request.VehiclePlate?.ToUpper(),
                PersonToVisitEmail = request.PersonToVisitEmail?.ToLower(),
                SendEmail = request.SendEmail,
                AssignedCarnet = request.AssignedCarnet
            };

            var createdVisit = await _visitRepository.AddAsync(visit);

            // 2. Asociar visitantes (si se proporcionaron)
            if (request.VisitorIds != null && request.VisitorIds.Any())
            {
                foreach (var visitorId in request.VisitorIds)
                {
                    var visitor = await _visitorRepository.GetByIdAsync(visitorId);
                    if (visitor == null)
                    {
                        _logger.LogWarning("Visitor {VisitorId} not found when creating visit", visitorId);
                        continue;
                    }

                    // Agregar el visitante a la colección de la visita
                    createdVisit.Visitors.Add(visitor);
                }

                // Guardar los cambios para crear los registros en visit_visitor
                await _visitRepository.UpdateAsync(createdVisit);
            }

            // 3. Log de auditor�a
            await LogVisitAction("create", createdVisit.Id, createdByUserId, new
            {
                department = request.Department,
                mission_case = request.MissionCase,
                visitor_count = request.VisitorIds?.Count ?? 0
            });

            _logger.LogInformation(
                "Visit {VisitId} created by user {UserId} for department {Department}",
                createdVisit.Id, createdByUserId, request.Department);

            return (true, createdVisit, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating visit");
            return (false, null, "Error al crear la visita");
        }
    }

    /// <summary>
    /// Cerrar una visita
    /// Mapea closeVisit de VisitService Laravel
    /// </summary>
    public async Task<(bool Success, Visit? Visit, string? Error)> CloseVisitAsync(
        int visitId, 
        int closedByUserId, 
        string? observations = null)
    {
        try
        {
            // 1. Obtener la visita
            var visit = await _visitRepository.GetVisitWithDetailsAsync(visitId);
            
            if (visit == null)
            {
                return (false, null, "Visita no encontrada");
            }

            // 2. Verificar que no est� ya cerrada
            if (visit.StatusId == (int)Enums.VisitStatus.Cerrado)
            {
                return (false, null, "La visita ya est� cerrada");
            }

            // 3. Actualizar datos de cierre
            var oldStatus = visit.StatusId;
            
            visit.StatusId = (int)Enums.VisitStatus.Cerrado;
            visit.EndAt = DateTime.UtcNow;
            visit.ClosedBy = closedByUserId;

            var updatedVisit = await _visitRepository.UpdateAsync(visit);

            // 4. Log de auditor�a
            await LogVisitAction("close", visitId, closedByUserId, new
            {
                duration_minutes = (visit.EndAt.Value - visit.CreatedAt).TotalMinutes,
                observations = observations,
                old_status = oldStatus,
                new_status = visit.StatusId
            });

            _logger.LogInformation(
                "Visit {VisitId} closed by user {UserId}. Duration: {Duration} minutes",
                visitId, closedByUserId, (visit.EndAt.Value - visit.CreatedAt).TotalMinutes);

            return (true, updatedVisit, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing visit {VisitId}", visitId);
            return (false, null, "Error al cerrar la visita");
        }
    }

    /// <summary>
    /// Actualizar placa de veh�culo
    /// Mapea updateVehiclePlate de VisitController Laravel
    /// </summary>
    public async Task<(bool Success, Visit? Visit, string? Error)> UpdateVehiclePlateAsync(
        int visitId, 
        string? vehiclePlate)
    {
        try
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            
            if (visit == null)
            {
                return (false, null, "Visita no encontrada");
            }

            var oldPlate = visit.VehiclePlate;
            visit.VehiclePlate = vehiclePlate?.ToUpper();

            var updatedVisit = await _visitRepository.UpdateAsync(visit);

            await LogVisitAction("update_vehicle_plate", visitId, null, new
            {
                old_plate = oldPlate,
                new_plate = vehiclePlate
            });

            _logger.LogInformation(
                "Vehicle plate updated for visit {VisitId}: {OldPlate} -> {NewPlate}",
                visitId, oldPlate ?? "null", vehiclePlate ?? "null");

            return (true, updatedVisit, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating vehicle plate for visit {VisitId}", visitId);
            return (false, null, "Error al actualizar la placa del veh�culo");
        }
    }

    /// <summary>
    /// Asignar carnet a una visita
    /// Mapea assignCarnet de VisitController Laravel
    /// </summary>
    public async Task<(bool Success, Visit? Visit, string? Error)> AssignCarnetAsync(
        int visitId, 
        int carnetNumber)
    {
        try
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            
            if (visit == null)
            {
                return (false, null, "Visita no encontrada");
            }

            var oldCarnet = visit.AssignedCarnet;
            visit.AssignedCarnet = carnetNumber;

            var updatedVisit = await _visitRepository.UpdateAsync(visit);

            await LogVisitAction("assign_carnet", visitId, null, new
            {
                old_carnet = oldCarnet,
                new_carnet = carnetNumber
            });

            _logger.LogInformation(
                "Carnet {CarnetNumber} assigned to visit {VisitId}",
                carnetNumber, visitId);

            return (true, updatedVisit, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning carnet to visit {VisitId}", visitId);
            return (false, null, "Error al asignar el carnet");
        }
    }

    /// <summary>
    /// Obtener estad�sticas del dashboard
    /// Mapea getDashboardStats de VisitController Laravel
    /// </summary>
    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var weekStart = today.AddDays(-(int)today.DayOfWeek);

            // Visitas de hoy
            var todayVisits = await _visitRepository.GetTodayVisitsAsync();
            
            // Visitas de esta semana
            var weekVisits = await _visitRepository.GetVisitsByDateRangeAsync(
                weekStart, 
                today.AddDays(1).AddTicks(-1));

            // Visitas activas
            var activeVisits = await _visitRepository.GetActiveVisitsAsync();

            // Calcular promedio diario de la semana
            var daysInWeek = (today - weekStart).Days + 1;
            var dailyAverage = daysInWeek > 0 ? weekVisits.Count() / daysInWeek : 0;

            return new DashboardStatsDto
            {
                TodayVisits = todayVisits.Count(),
                WeekVisits = weekVisits.Count(),
                ActiveVisits = activeVisits.Count(),
                DailyAverage = dailyAverage
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return new DashboardStatsDto();
        }
    }

    /// <summary>
    /// Obtener estad�sticas solo de visitas misionales
    /// Mapea getMissionStatsOnly de VisitController Laravel
    /// </summary>
    public async Task<DashboardStatsDto> GetMissionStatsOnlyAsync()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var weekStart = today.AddDays(-(int)today.DayOfWeek);

            var todayMissionVisits = (await _visitRepository.GetTodayVisitsAsync())
                .Where(v => v.MissionCase);
            
            var weekMissionVisits = (await _visitRepository.GetVisitsByDateRangeAsync(weekStart, today.AddDays(1).AddTicks(-1)))
                .Where(v => v.MissionCase);

            var activeMissionVisits = await _visitRepository.GetActiveMissionVisitsAsync();

            var daysInWeek = (today - weekStart).Days + 1;
            var dailyAverage = daysInWeek > 0 ? weekMissionVisits.Count() / daysInWeek : 0;

            return new DashboardStatsDto
            {
                TodayVisits = todayMissionVisits.Count(),
                WeekVisits = weekMissionVisits.Count(),
                ActiveVisits = activeMissionVisits.Count(),
                DailyAverage = dailyAverage
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mission stats");
            return new DashboardStatsDto();
        }
    }

    /// <summary>
    /// Registrar acci�n de visita en audit log
    /// </summary>
    private async Task LogVisitAction(string action, int visitId, int? userId, object metadata)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                ResourceType = "visit",
                ResourceId = visitId,
                Metadata = System.Text.Json.JsonSerializer.Serialize(metadata),
                Severity = action == "create" ? AuditSeverity.Medium : AuditSeverity.Low,
                Tags = $"[\"visit\",\"{action}\"]"
            };

            await _auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging visit action");
        }
    }
}
