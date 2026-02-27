using System.Net;
using System.Text.Json;

namespace ProductosAPI.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var code = ex switch
        {
            ArgumentException    => HttpStatusCode.BadRequest,
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            _                    => HttpStatusCode.InternalServerError
        };

        var result = JsonSerializer.Serialize(new
        {
            error   = ex.Message,
            codigo  = (int)code,
            timestamp = DateTime.UtcNow
        });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)code;
        return context.Response.WriteAsync(result);
    }
}
