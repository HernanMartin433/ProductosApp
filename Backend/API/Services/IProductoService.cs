using ProductosAPI.DTOs;

namespace ProductosAPI.Services;

public interface IProductoService
{
    Task<IEnumerable<ProductoDto>> GetAllAsync(bool soloActivos = true);
    Task<ProductoDto?> GetByIdAsync(int id);
    Task<ProductoDto> CreateAsync(CreateProductoDto dto);
    Task<ProductoDto?> UpdateAsync(int id, UpdateProductoDto dto);
    Task<bool> DeleteAsync(int id);
}
