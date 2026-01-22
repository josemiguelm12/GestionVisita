namespace GestionVisitaAPI.Enums;

/// <summary>
/// Estados de una visita
/// Mapea EnumVisitStatuses de Laravel
/// </summary>
public enum VisitStatus
{
    /// <summary>
    /// Visita abierta/activa
    /// </summary>
    Abierto = 1,

    /// <summary>
    /// Visita cerrada/finalizada
    /// </summary>
    Cerrado = 2
}

/// <summary>
/// Extensiones para el enum VisitStatus
/// </summary>
public static class VisitStatusExtensions
{
    /// <summary>
    /// Obtiene el label legible del estado
    /// </summary>
    public static string GetLabel(this VisitStatus status)
    {
        return status switch
        {
            VisitStatus.Abierto => "Abierto",
            VisitStatus.Cerrado => "Cerrado",
            _ => "Desconocido"
        };
    }

    /// <summary>
    /// Verifica si la visita está activa
    /// </summary>
    public static bool IsActive(this VisitStatus status)
    {
        return status == VisitStatus.Abierto;
    }

    /// <summary>
    /// Obtiene el estado desde un int
    /// </summary>
    public static VisitStatus FromInt(int value)
    {
        return value switch
        {
            1 => VisitStatus.Abierto,
            2 => VisitStatus.Cerrado,
            _ => throw new ArgumentOutOfRangeException(nameof(value), "Estado de visita inválido")
        };
    }
}
