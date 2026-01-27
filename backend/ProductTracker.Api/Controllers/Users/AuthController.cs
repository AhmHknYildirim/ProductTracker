using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Users.Login;
using ProductTracker.Api.Applications.Users.Register;

namespace ProductTracker.Api.Controllers.Users;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        [FromServices] RegisterHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        [FromServices] LoginHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(request, ct);
        return Ok(result);
    }
}
