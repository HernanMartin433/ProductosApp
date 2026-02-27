using Microsoft.EntityFrameworkCore;
using ProductosAPI.Entities;

namespace ProductosAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("Productos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).UseIdentityColumn();
            entity.Property(e => e.Nombre).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.Precio).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Stock).IsRequired();
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.Activo).HasDefaultValue(true);
        });
    }
}
