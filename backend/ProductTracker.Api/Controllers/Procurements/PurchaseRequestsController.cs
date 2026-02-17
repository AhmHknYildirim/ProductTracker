using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.List;

namespace ProductTracker.Api.Controllers.Procurements;

[Authorize]
[ApiController]
[Route("api/purchase-requests")]
[Route("api/procurements/purchase-requests")]
public sealed class PurchaseRequestsController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreatePurchaseRequestRequest request,
        [FromServices] CreatePurchaseRequestHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(request, ct);
        return CreatedAtAction(nameof(List), new { }, result);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] ListPurchaseRequestsQuery query,
        [FromServices] ListPurchaseRequestsHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(query, ct);
        return Ok(result);
    }
}
