namespace GestionVisitaAPI.Middleware;

/// <summary>
/// Middleware para agregar headers de seguridad HTTP
/// Protege contra vulnerabilidades comunes (XSS, clickjacking, etc)
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // X-Content-Type-Options: Previene MIME-type sniffing
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";

        // X-Frame-Options: Previene clickjacking
        context.Response.Headers["X-Frame-Options"] = "DENY";

        // X-XSS-Protection: Protección XSS en navegadores legacy
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";

        // Referrer-Policy: Controla información de referrer
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Content-Security-Policy: Previene XSS y data injection
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none';";

        // Permissions-Policy: Controla features del navegador
        context.Response.Headers["Permissions-Policy"] =
            "geolocation=(), " +
            "microphone=(), " +
            "camera=()";

        await _next(context);
    }
}
