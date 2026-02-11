using Microsoft.AspNetCore.Mvc;
using GestionVisitaAPI.Data;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HealthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("db")]
    public async Task<IActionResult> Db()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            return Ok(new
            {
                database = "supabase",
                status = canConnect ? "OK" : "FAIL"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                error = ex.Message
            });
        }
    }
}
