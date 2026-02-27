using ProductosAPI.Entities;

namespace ProductosAPI.Repositories;

public interface IProductoRepository
{
    Task<IEnumerable<Producto>> GetAllAsync(bool soloActivos = true);
    Task<Producto?> GetByIdAsync(int id);
    Task<Producto> CreateAsync(Producto producto);
    Task<Producto?> UpdateAsync(Producto producto);
    Task<bool> DeleteLogicAsync(int id);
}
