using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionVisitaAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Crear índices si no existen (usando IF NOT EXISTS para evitar errores)
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_visits_MissionCase"" 
                ON visits (""MissionCase"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_visits_UserId"" 
                ON visits (""UserId"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_visits_ClosedBy"" 
                ON visits (""ClosedBy"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_visits_StatusId_CreatedAt"" 
                ON visits (""StatusId"", ""CreatedAt"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_visits_StatusId_MissionCase"" 
                ON visits (""StatusId"", ""MissionCase"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_visits_CreatedAt_StatusId_MissionCase"" 
                ON visits (""CreatedAt"", ""StatusId"", ""MissionCase"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar índices si existen
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_visits_MissionCase"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_visits_UserId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_visits_ClosedBy"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_visits_StatusId_CreatedAt"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_visits_StatusId_MissionCase"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_visits_CreatedAt_StatusId_MissionCase"";");
        }
    }
}
