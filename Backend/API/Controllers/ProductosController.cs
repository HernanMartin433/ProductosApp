using Microsoft.AspNetCore.Mvc;
using ProductosAPI.DTOs;
using ProductosAPI.Logs;
using ProductosAPI.Services;
//un comentario
namespace ProductosAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _service;
    private readonly ILogService _log;

    public ProductosController(IProductoService service, ILogService log)
    {
        _service = service;
        _log     = log;
    }

    // GET /api/v1/productos?soloActivos=true
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductoDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] bool soloActivos = true)
    {
        var productos = await _service.GetAllAsync(soloActivos);
        return Ok(productos);
    }

    // GET /api/v1/productos/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductoDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var producto = await _service.GetByIdAsync(id);
        return producto is null ? NotFound(new { mensaje = $"Producto {id} no encontrado" }) : Ok(producto);
    }

    // POST /api/v1/productos
    [HttpPost]
    [ProducesResponseType(typeof(ProductoDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateProductoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        //
    }

    // PUT /api/v1/productos/{id}
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProductoDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _service.UpdateAsync(id, dto);
        return updated is null ? NotFound(new { mensaje = $"Producto {id} no encontrado" }) : Ok(updated);
    }

    // DELETE /api/v1/productos/{id}
    [HttpDelete("{id:int}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound(new { mensaje = $"Producto {id} no encontrado" });
    }

    // GET /api/v1/productos/{id}/logs
    [HttpGet("{id:int}/logs")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetLogs(int id)
    {
        var logs = await _log.ObtenerLogsAsync(id);
        return Ok(logs);
    }
}
