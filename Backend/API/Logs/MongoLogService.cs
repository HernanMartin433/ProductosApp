using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace ProductosAPI.Logs;

// ── MongoDB Document ──────────────────────────────────────────────
public class ProductoLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Accion { get; set; } = string.Empty;       // CREATE | UPDATE | DELETE
    public int ProductoId { get; set; }
    public string? Detalle { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

// ── Interface ─────────────────────────────────────────────────────
public interface ILogService
{
    Task RegistrarAsync(string accion, int productoId, string? detalle = null);
    Task<List<ProductoLog>> ObtenerLogsAsync(int? productoId = null);
}

// ── Implementation ────────────────────────────────────────────────
public class MongoLogService : ILogService
{
    private readonly IMongoCollection<ProductoLog> _collection;

    public MongoLogService(IConfiguration config)
    {
        var connectionString = config["MongoDB:ConnectionString"] ?? "mongodb://localhost:27017";
        var databaseName     = config["MongoDB:Database"]         ?? "ProductosDB";
        var collectionName   = config["MongoDB:Collection"]       ?? "Logs";

        var client = new MongoClient(connectionString);
        var db     = client.GetDatabase(databaseName);
        _collection = db.GetCollection<ProductoLog>(collectionName);
    }

    public async Task RegistrarAsync(string accion, int productoId, string? detalle = null)
    {
        var log = new ProductoLog
        {
            Accion     = accion,
            ProductoId = productoId,
            Detalle    = detalle,
            Timestamp  = DateTime.UtcNow
        };
        await _collection.InsertOneAsync(log);
    }

    public async Task<List<ProductoLog>> ObtenerLogsAsync(int? productoId = null)
    {
        var filter = productoId.HasValue
            ? Builders<ProductoLog>.Filter.Eq(l => l.ProductoId, productoId.Value)
            : Builders<ProductoLog>.Filter.Empty;

        return await _collection.Find(filter)
                                .SortByDescending(l => l.Timestamp)
                                .Limit(100)
                                .ToListAsync();
    }
}
