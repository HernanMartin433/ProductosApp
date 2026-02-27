namespace ProductosAPI.DTOs;

public record ProductoDto(
    int Id,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock,
    DateTime FechaCreacion,
    bool Activo
);

public record CreateProductoDto(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock
);

public record UpdateProductoDto(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock,
    bool Activo
);
