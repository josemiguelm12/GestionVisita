using System.Net;
using System.Text.Json;
using GestionVisitaAPI.Services;

namespace GestionVisitaAPI.Middleware;

/// <summary>
/// Middleware global para manejo centralizado de excepciones
/// Captura todas las excepciones no controladas y retorna respuestas JSON consistentes
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new
        {
            success = false,
            message = "An error occurred processing your request.",
            error = exception.Message,
            timestamp = DateTime.UtcNow
        };

        switch (exception)
        {
            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = new
                {
                    success = false,
                    message = "Unauthorized access.",
                    error = exception.Message,
                    timestamp = DateTime.UtcNow
                };
                break;

            case KeyNotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse = new
                {
                    success = false,
                    message = "Resource not found.",
                    error = exception.Message,
                    timestamp = DateTime.UtcNow
                };
                break;

            case ArgumentException:
            case InvalidOperationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new
                {
                    success = false,
                    message = "Invalid request.",
                    error = exception.Message,
                    timestamp = DateTime.UtcNow
                };
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse = new
                {
                    success = false,
                    message = "Internal server error.",
                    error = context.Request.Host.Host == "localhost" ? exception.Message : "An unexpected error occurred.",
                    timestamp = DateTime.UtcNow
                };
                break;
        }

        var result = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteAsync(result);
    }
}
