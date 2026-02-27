using Microsoft.EntityFrameworkCore;
using ProductosAPI.Data;
using ProductosAPI.Logs;
using ProductosAPI.Middleware;
using ProductosAPI.Repositories;
using ProductosAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── SQL Server ────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer")));

// ── Dependency Injection ──────────────────────────────────────────
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<IProductoService, ProductoService>();

// MongoDB es opcional — si falla la conexión, se usa NullLogService
builder.Services.AddSingleton<ILogService>(sp =>
{
    try
    {
        var cfg = sp.GetRequiredService<IConfiguration>();
        return new MongoLogService(cfg);
    }
    catch (Exception ex)
    {
        var logger = sp.GetRequiredService<ILogger<MongoLogService>>();
        logger.LogWarning("MongoDB no disponible, usando NullLogService: {msg}", ex.Message);
        return new NullLogService();
    }
});

// ── Controllers + Swagger ─────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Productos API", Version = "v1" });
});

// ── CORS (dev-friendly) ───────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Productos API v1");
    c.RoutePrefix = "swagger";
});

// Redirigir raíz al Swagger
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.UseRouting();
app.UseCors("DevPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();
