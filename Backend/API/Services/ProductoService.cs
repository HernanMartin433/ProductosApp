using ProductosAPI.DTOs;
using ProductosAPI.Entities;
using ProductosAPI.Logs;
using ProductosAPI.Repositories;

namespace ProductosAPI.Services;

public class ProductoService : IProductoService
{
    private readonly IProductoRepository _repo;
    private readonly ILogService _log;

    public ProductoService(IProductoRepository repo, ILogService log)
    {
        _repo = repo;
        _log  = log;
    }

    public async Task<IEnumerable<ProductoDto>> GetAllAsync(bool soloActivos = true)
    {
        var productos = await _repo.GetAllAsync(soloActivos);
        return productos.Select(ToDto);
    }

    public async Task<ProductoDto?> GetByIdAsync(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p is null ? null : ToDto(p);
    }

    public async Task<ProductoDto> CreateAsync(CreateProductoDto dto)
    {
        var entity = new Producto
        {
            Nombre       = dto.Nombre.Trim(),
            Descripcion  = dto.Descripcion?.Trim(),
            Precio       = dto.Precio,
            Stock        = dto.Stock,
            FechaCreacion = DateTime.Now,
            Activo       = true
        };

        var created = await _repo.CreateAsync(entity);
        await _log.RegistrarAsync("CREATE", created.Id, $"Producto '{created.Nombre}' creado");
        return ToDto(created);
    }

    public async Task<ProductoDto?> UpdateAsync(int id, UpdateProductoDto dto)
    {
        var entity = new Producto
        {
            Id          = id,
            Nombre      = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Precio      = dto.Precio,
            Stock       = dto.Stock,
            Activo      = dto.Activo
        };

        var updated = await _repo.UpdateAsync(entity);
        if (updated is null) return null;

        await _log.RegistrarAsync("UPDATE", id, $"Producto '{updated.Nombre}' actualizado");
        return ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var result = await _repo.DeleteLogicAsync(id);
        if (result) await _log.RegistrarAsync("DELETE", id, "Eliminación lógica");
        return result;
    }

    private static ProductoDto ToDto(Producto p) => new(
        p.Id, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.FechaCreacion, p.Activo
    );
}
