using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Procurements.Units.List;

namespace ProductTracker.Api.Controllers.Procurements;

[Authorize]
[ApiController]
[Route("api/units")]
public sealed class UnitsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromServices] ListUnitsHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(ct);
        return Ok(result);
    }
}
