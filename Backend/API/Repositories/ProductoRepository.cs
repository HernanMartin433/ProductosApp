using Microsoft.EntityFrameworkCore;
using ProductosAPI.Data;
using ProductosAPI.Entities;

namespace ProductosAPI.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly AppDbContext _ctx;

    public ProductoRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Producto>> GetAllAsync(bool soloActivos = true)
    {
        var query = _ctx.Productos.AsQueryable();
        if (soloActivos) query = query.Where(p => p.Activo);
        return await query.OrderByDescending(p => p.FechaCreacion).ToListAsync();
    }

    public async Task<Producto?> GetByIdAsync(int id) =>
        await _ctx.Productos.FindAsync(id);

    public async Task<Producto> CreateAsync(Producto producto)
    {
        _ctx.Productos.Add(producto);
        await _ctx.SaveChangesAsync();
        return producto;
    }

    public async Task<Producto?> UpdateAsync(Producto producto)
    {
        var existing = await _ctx.Productos.FindAsync(producto.Id);
        if (existing is null) return null;

        existing.Nombre      = producto.Nombre;
        existing.Descripcion = producto.Descripcion;
        existing.Precio      = producto.Precio;
        existing.Stock       = producto.Stock;
        existing.Activo      = producto.Activo;

        await _ctx.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteLogicAsync(int id)
    {
        var producto = await _ctx.Productos.FindAsync(id);
        if (producto is null) return false;

        producto.Activo = false;
        await _ctx.SaveChangesAsync();
        return true;
    }
}
