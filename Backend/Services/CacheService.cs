using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace GestionVisitaAPI.Services;

/// <summary>
/// Servicio de abstracción de caché
/// Soporta Memory Cache (desarrollo) y Redis (producción)
/// Mapea CacheService de Laravel
/// </summary>
public class CacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache? _distributedCache;
    private readonly ILogger<CacheService> _logger;
    private readonly bool _useDistributedCache;

    public CacheService(
        IMemoryCache memoryCache,
        IDistributedCache? distributedCache,
        ILogger<CacheService> logger,
        IConfiguration configuration)
    {
        _memoryCache = memoryCache;
        _distributedCache = distributedCache;
        _logger = logger;
        
        // Usar distributed cache solo si está configurado (producción con Redis)
        var redisConnection = configuration.GetSection("CacheSettings:RedisConnection").Value;
        _useDistributedCache = !string.IsNullOrEmpty(redisConnection) && distributedCache != null;
    }

    /// <summary>
    /// Obtener valor del caché
    /// </summary>
    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            if (_useDistributedCache && _distributedCache != null)
            {
                var cachedData = await _distributedCache.GetStringAsync(key);
                if (cachedData != null)
                {
                    return JsonSerializer.Deserialize<T>(cachedData);
                }
            }
            else
            {
                if (_memoryCache.TryGetValue(key, out T? value))
                {
                    return value;
                }
            }

            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache key: {Key}", key);
            return default;
        }
    }

    /// <summary>
    /// Guardar valor en caché con expiración
    /// </summary>
    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        try
        {
            var expirationTime = expiration ?? TimeSpan.FromMinutes(5);

            if (_useDistributedCache && _distributedCache != null)
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expirationTime
                };

                var serializedData = JsonSerializer.Serialize(value);
                await _distributedCache.SetStringAsync(key, serializedData, options);
            }
            else
            {
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expirationTime
                };

                _memoryCache.Set(key, value, cacheOptions);
            }

            _logger.LogDebug("Cache set: {Key} with expiration {Expiration}", key, expirationTime);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache key: {Key}", key);
        }
    }

    /// <summary>
    /// Eliminar valor del caché
    /// </summary>
    public async Task RemoveAsync(string key)
    {
        try
        {
            if (_useDistributedCache && _distributedCache != null)
            {
                await _distributedCache.RemoveAsync(key);
            }
            else
            {
                _memoryCache.Remove(key);
            }

            _logger.LogDebug("Cache removed: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache key: {Key}", key);
        }
    }

    /// <summary>
    /// Obtener o crear valor en caché (Remember pattern)
    /// </summary>
    public async Task<T> GetOrSetAsync<T>(
        string key, 
        Func<Task<T>> factory, 
        TimeSpan? expiration = null)
    {
        try
        {
            // Intentar obtener del caché
            var cachedValue = await GetAsync<T>(key);
            if (cachedValue != null)
            {
                return cachedValue;
            }

            // Si no existe, ejecutar factory y guardar
            var value = await factory();
            await SetAsync(key, value, expiration);

            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetOrSet for key: {Key}", key);
            
            // Si falla el caché, al menos ejecutar la factory
            return await factory();
        }
    }

    /// <summary>
    /// Verificar si existe una key en caché
    /// </summary>
    public async Task<bool> ExistsAsync(string key)
    {
        try
        {
            if (_useDistributedCache && _distributedCache != null)
            {
                var value = await _distributedCache.GetStringAsync(key);
                return value != null;
            }
            else
            {
                return _memoryCache.TryGetValue(key, out _);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking cache key existence: {Key}", key);
            return false;
        }
    }

    /// <summary>
    /// Limpiar múltiples keys por patrón (solo para Memory Cache)
    /// NOTA: Redis requeriría Lua script o KeyScan
    /// </summary>
    public void RemoveByPattern(string pattern)
    {
        try
        {
            // Esta funcionalidad es limitada en Memory Cache
            // En producción con Redis, se usaría SCAN + DEL
            _logger.LogWarning("RemoveByPattern is not fully supported in current cache implementation");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache by pattern: {Pattern}", pattern);
        }
    }

    /// <summary>
    /// Helper: Cache key para visitas activas
    /// </summary>
    public string GetActiveVisitsCacheKey(bool missionOnly = false, bool nonMissionOnly = false)
    {
        if (missionOnly) return "visits:active:mission";
        if (nonMissionOnly) return "visits:active:non_mission";
        return "visits:active";
    }

    /// <summary>
    /// Helper: Cache key para estadísticas
    /// </summary>
    public string GetStatsCacheKey(string statsType)
    {
        return $"stats:{statsType}";
    }

    /// <summary>
    /// Helper: Invalidar caché de visitas
    /// </summary>
    public async Task InvalidateVisitsCacheAsync()
    {
        await RemoveAsync("visits:active");
        await RemoveAsync("visits:active:mission");
        await RemoveAsync("visits:active:non_mission");
        await RemoveAsync("stats:dashboard");
        await RemoveAsync("stats:mission");
        await RemoveAsync("stats:non_mission");

        _logger.LogInformation("Visits cache invalidated");
    }
}
