namespace ProductosAPI.Logs;

/// <summary>
/// Implementación vacía de ILogService para cuando MongoDB no está disponible.
/// Permite que la API funcione sin depender de Mongo.
/// </summary>
public class NullLogService : ILogService
{
    public Task RegistrarAsync(string accion, int productoId, string? detalle = null)
        => Task.CompletedTask;

    public Task<List<ProductoLog>> ObtenerLogsAsync(int? productoId = null)
        => Task.FromResult(new List<ProductoLog>());
}
