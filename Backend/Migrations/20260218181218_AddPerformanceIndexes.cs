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
            // Índices para optimizar consultas frecuentes
            // Nota: IX_visits_UserId, IX_visits_ClosedBy y IX_visits_StatusId ya existen (foreign keys)
            migrationBuilder.Sql(@"
                CREATE NONCLUSTERED INDEX IX_visits_MissionCase 
                ON visits (MissionCase) 
                INCLUDE (StatusId, CreatedAt);

                CREATE NONCLUSTERED INDEX IX_visits_StatusId_CreatedAt 
                ON visits (StatusId, CreatedAt DESC);

                CREATE NONCLUSTERED INDEX IX_visits_StatusId_MissionCase 
                ON visits (StatusId, MissionCase) 
                INCLUDE (CreatedAt, Department);

                CREATE NONCLUSTERED INDEX IX_visits_CreatedAt_StatusId_MissionCase 
                ON visits (CreatedAt DESC, StatusId, MissionCase);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS IX_visits_CreatedAt_StatusId_MissionCase ON visits;
                DROP INDEX IF EXISTS IX_visits_StatusId_MissionCase ON visits;
                DROP INDEX IF EXISTS IX_visits_StatusId_CreatedAt ON visits;
                DROP INDEX IF EXISTS IX_visits_MissionCase ON visits;
            ");
        }
    }
}
