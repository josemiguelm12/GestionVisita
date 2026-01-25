using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Identity.Web;
using System.Text;
using GestionVisitaAPI.Data;
using Serilog;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

#region Configuración de Serilog (Logging)

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

#endregion

#region Configuración de Base de Datos

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(5);
    }));

#endregion

#region Configuración de CORS

var corsOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

#endregion

#region Configuración de JWT Authentication

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // En producción debe ser true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

#endregion

#region Configuración de Microsoft Identity (SSO Microsoft 365)

// TEMPORALMENTE DESHABILITADO - Conflicto con JWT Bearer
// Descomentar cuando se implemente SSO con Microsoft 365
// builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration, "AzureAd");

#endregion

#region Configuración de AutoMapper

// TODO: Descomentar cuando se creen los perfiles de AutoMapper
// builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

#endregion

#region Configuración de Caché Distribuido (Redis / InMemory)

// Agregar IMemoryCache (requerido por CacheService)
builder.Services.AddMemoryCache();

if (builder.Environment.IsProduction())
{
    var redisConnection = builder.Configuration.GetSection("CacheSettings:RedisConnection").Value;

    if (!string.IsNullOrEmpty(redisConnection))
    {
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnection;
            options.InstanceName = "GestionVisitas_";
        });
    }
    else
    {
        // Fallback seguro
        builder.Services.AddDistributedMemoryCache();
    }
}
else
{
    // Desarrollo local
    builder.Services.AddDistributedMemoryCache();
}

#endregion


#region Configuración de Application Insights (Azure Monitoring)

if (builder.Environment.IsProduction())
{
    builder.Services.AddApplicationInsightsTelemetry(builder.Configuration["ApplicationInsights:ConnectionString"]);
}

#endregion

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// Swagger/OpenAPI - TEMPORALMENTE DESHABILITADO (incompatibilidad versión)
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// Servicios personalizados - Repositorios
builder.Services.AddScoped<GestionVisitaAPI.Repositories.Interfaces.IVisitRepository, GestionVisitaAPI.Repositories.Implementations.VisitRepository>();
builder.Services.AddScoped<GestionVisitaAPI.Repositories.Interfaces.IVisitorRepository, GestionVisitaAPI.Repositories.Implementations.VisitorRepository>();
builder.Services.AddScoped<GestionVisitaAPI.Repositories.Interfaces.IUserRepository, GestionVisitaAPI.Repositories.Implementations.UserRepository>();
builder.Services.AddScoped<GestionVisitaAPI.Repositories.Interfaces.IAuditLogRepository, GestionVisitaAPI.Repositories.Implementations.AuditLogRepository>();

// Helpers
builder.Services.AddScoped<GestionVisitaAPI.Helpers.JwtHelper>();

// Servicios de Negocio
builder.Services.AddScoped<GestionVisitaAPI.Services.AuthService>();
builder.Services.AddScoped<GestionVisitaAPI.Services.VisitService>();
builder.Services.AddScoped<GestionVisitaAPI.Services.VisitorService>();
builder.Services.AddScoped<GestionVisitaAPI.Services.LoggerService>();
builder.Services.AddScoped<GestionVisitaAPI.Services.CacheService>();


builder.Services.AddAuthorization();

var app = builder.Build();

#region Configuración del Pipeline HTTP

// Configure the HTTP request pipeline
// SWAGGER TEMPORALMENTE DESHABILITADO
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI(c =>
//     {
//         c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gestión de Visitas API v1");
//     });
// }

// ✅ Middlewares Personalizados (EN ORDEN DE PRIORIDAD)
app.UseMiddleware<GestionVisitaAPI.Middleware.ExceptionHandlingMiddleware>();
app.UseMiddleware<GestionVisitaAPI.Middleware.SecurityHeadersMiddleware>();
app.UseMiddleware<GestionVisitaAPI.Middleware.PerformanceMonitoringMiddleware>();
app.UseMiddleware<GestionVisitaAPI.Middleware.RequestLoggingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// ✅ Audit Middleware (después de autenticación)
app.UseMiddleware<GestionVisitaAPI.Middleware.AuditMiddleware>();

app.MapControllers();

#endregion

#region Migración Automática de BD (Solo Development)

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        Log.Information("Aplicando migraciones pendientes...");
        dbContext.Database.Migrate();
        Log.Information("Migraciones aplicadas exitosamente");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error al aplicar migraciones de base de datos");
    }
}

#endregion

Log.Information("Aplicación iniciada");

app.Run();

