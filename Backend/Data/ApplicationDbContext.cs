using Microsoft.EntityFrameworkCore;
using GestionVisitaAPI.Models;
using System.Text.Json;

namespace GestionVisitaAPI.Data;

/// <summary>
/// Contexto de base de datos para el sistema de gesti�n de visitas
/// Configura todas las entidades y sus relaciones
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    #region DbSets

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Visit> Visits { get; set; }
    public DbSet<Visitor> Visitors { get; set; }
    public DbSet<VisitStatusEntity> VisitStatuses { get; set; }
    public DbSet<VisitVisitor> VisitVisitors { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        #region Role Configuration

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Name).IsRequired().HasMaxLength(255);
            entity.Property(r => r.Description).HasMaxLength(500);
            
            entity.HasIndex(r => r.Name).IsUnique();
        });

        #endregion

        #region User Configuration

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(255);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.Password).HasMaxLength(255);
            entity.Property(u => u.MicrosoftId).HasMaxLength(255);
            entity.Property(u => u.IsActive).HasDefaultValue(true);

            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.MicrosoftId);

            // Relaci�n muchos a muchos con Role
            entity.HasMany(u => u.Roles)
                .WithMany(r => r.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "role_user",
                    j => j.HasOne<Role>().WithMany().HasForeignKey("role_id"),
                    j => j.HasOne<User>().WithMany().HasForeignKey("user_id")
                );

            // Auto-referencia: Usuario que cre� este usuario
            entity.HasOne(u => u.Creator)
                .WithMany(u => u.CreatedUsers)
                .HasForeignKey(u => u.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Relaci�n con visitas creadas
            entity.HasMany(u => u.CreatedVisits)
                .WithOne(v => v.Creator)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relaci�n con visitas cerradas
            entity.HasMany(u => u.ClosedVisits)
                .WithOne(v => v.Closer)
                .HasForeignKey(v => v.ClosedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Relaci�n con visitantes creados
            entity.HasMany(u => u.CreatedVisitors)
                .WithOne(v => v.Creator)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        #endregion

        #region VisitStatusEntity Configuration

        modelBuilder.Entity<VisitStatusEntity>(entity =>
        {
            entity.HasKey(vs => vs.Id);
            entity.Property(vs => vs.Name).IsRequired().HasMaxLength(255);

            entity.HasIndex(vs => vs.Name).IsUnique();
        });

        #endregion

        #region Visitor Configuration

        modelBuilder.Entity<Visitor>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.IdentityDocument).HasMaxLength(255);
            entity.Property(v => v.DocumentType).IsRequired();
            entity.Property(v => v.Name).IsRequired().HasMaxLength(255);
            entity.Property(v => v.LastName).IsRequired().HasMaxLength(255);
            entity.Property(v => v.Phone).HasMaxLength(20);
            entity.Property(v => v.Email).HasMaxLength(255);
            entity.Property(v => v.Institution).HasMaxLength(255);

            // Index �nico condicional: solo para documentos no nulos
            entity.HasIndex(v => v.IdentityDocument)
                .IsUnique()
                .HasFilter("\"IdentityDocument\" IS NOT NULL");

            entity.HasIndex(v => v.Email);
        });

        #endregion

        #region Visit Configuration

        modelBuilder.Entity<Visit>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.NamePersonToVisit).IsRequired().HasMaxLength(255);
            entity.Property(v => v.Department).IsRequired().HasMaxLength(255);
            entity.Property(v => v.Building).IsRequired(false);
            entity.Property(v => v.Floor).IsRequired(false);
            entity.Property(v => v.Reason).HasMaxLength(500);
            entity.Property(v => v.VehiclePlate).HasMaxLength(20);
            entity.Property(v => v.PersonToVisitEmail).HasMaxLength(255);
            entity.Property(v => v.MissionCase).HasDefaultValue(false);
            entity.Property(v => v.SendEmail).HasDefaultValue(false);

            entity.HasIndex(v => v.StatusId);
            entity.HasIndex(v => v.CreatedAt);
            entity.HasIndex(v => v.EndAt);
            entity.HasIndex(v => v.VehiclePlate);
            entity.HasIndex(v => v.Department);

            // Relaci�n con VisitStatusEntity
            entity.HasOne(v => v.Status)
                .WithMany(vs => vs.Visits)
                .HasForeignKey(v => v.StatusId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        #endregion

        #region VisitVisitor Configuration (Tabla Pivot)

        modelBuilder.Entity<VisitVisitor>(entity =>
        {
            // Clave compuesta
            entity.HasKey(vv => new { vv.VisitId, vv.VisitorId });

            entity.HasIndex(vv => vv.CaseId);

            // Relaci�n con Visit
            entity.HasOne(vv => vv.Visit)
                .WithMany(v => v.VisitVisitors)
                .HasForeignKey(vv => vv.VisitId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relaci�n con Visitor
            entity.HasOne(vv => vv.Visitor)
                .WithMany(v => v.VisitVisitors)
                .HasForeignKey(vv => vv.VisitorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        #endregion

        #region AuditLog Configuration

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(al => al.Id);
            entity.Property(al => al.Action).IsRequired().HasMaxLength(255);
            entity.Property(al => al.ResourceType).IsRequired().HasMaxLength(255);
            entity.Property(al => al.IpAddress).HasMaxLength(45);
            entity.Property(al => al.SessionId).HasMaxLength(255);
            entity.Property(al => al.RequestMethod).HasMaxLength(10);
            entity.Property(al => al.Severity).IsRequired();

            entity.HasIndex(al => al.UserId);
            entity.HasIndex(al => al.Action);
            entity.HasIndex(al => al.ResourceType);
            entity.HasIndex(al => al.CreatedAt);
            entity.HasIndex(al => al.Severity);

            // Relaci�n con User
            entity.HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        #endregion

        #region Seed Data - Roles del Sistema

        var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Administrador del sistema", CreatedAt = seedDate, UpdatedAt = seedDate },
            new Role { Id = 2, Name = "Asist_adm", Description = "Asistente Administrativo", CreatedAt = seedDate, UpdatedAt = seedDate },
            new Role { Id = 3, Name = "Guardia", Description = "Personal de Seguridad", CreatedAt = seedDate, UpdatedAt = seedDate },
            new Role { Id = 4, Name = "aux_ugc", Description = "Auxiliar UGC", CreatedAt = seedDate, UpdatedAt = seedDate }
        );

        modelBuilder.Entity<VisitStatusEntity>().HasData(
            new VisitStatusEntity { Id = 1, Name = "Abierto", CreatedAt = seedDate, UpdatedAt = seedDate },
            new VisitStatusEntity { Id = 2, Name = "Cerrado", CreatedAt = seedDate, UpdatedAt = seedDate }
        );

        #endregion
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Actualiza autom�ticamente los timestamps de CreatedAt y UpdatedAt
    /// </summary>
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
        }
    }
}
