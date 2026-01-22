namespace GestionVisitaAPI.Enums;

/// <summary>
/// Tipos de documentos de identificación para visitantes
/// Mapea EnumDocumentType de Laravel
/// </summary>
public enum DocumentType
{
    /// <summary>
    /// Cédula de Ciudadanía
    /// </summary>
    Cedula = 1,

    /// <summary>
    /// Pasaporte
    /// </summary>
    Pasaporte = 2,

    /// <summary>
    /// Sin Identificación (visitantes sin documento)
    /// </summary>
    SinIdentificacion = 3
}

/// <summary>
/// Extensiones para el enum DocumentType
/// </summary>
public static class DocumentTypeExtensions
{
    /// <summary>
    /// Obtiene el label legible del tipo de documento
    /// </summary>
    public static string GetLabel(this DocumentType type)
    {
        return type switch
        {
            DocumentType.Cedula => "Cédula",
            DocumentType.Pasaporte => "Pasaporte",
            DocumentType.SinIdentificacion => "Sin Identificación",
            _ => "No capturado"
        };
    }

    /// <summary>
    /// Verifica si el documento requiere número de identificación
    /// </summary>
    public static bool RequiresDocument(this DocumentType type)
    {
        return type != DocumentType.SinIdentificacion;
    }

    /// <summary>
    /// Obtiene el tipo de documento desde un int
    /// </summary>
    public static DocumentType FromInt(int value)
    {
        return value switch
        {
            1 => DocumentType.Cedula,
            2 => DocumentType.Pasaporte,
            3 => DocumentType.SinIdentificacion,
            _ => throw new ArgumentOutOfRangeException(nameof(value), "Tipo de documento inválido")
        };
    }
}
