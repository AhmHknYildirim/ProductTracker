using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Approve;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Cancel;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.List;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Reject;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Submit;

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

    [HttpPost("{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(
        Guid id,
        [FromServices] ApprovePurchaseRequestHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(
        Guid id,
        [FromBody] RejectPurchaseRequestRequest request,
        [FromServices] RejectPurchaseRequestHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, request, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(
        Guid id,
        [FromBody] CancelPurchaseRequestRequest request,
        [FromServices] CancelPurchaseRequestHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, request, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/submit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit(
        Guid id,
        [FromServices] SubmitPurchaseRequestHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, ct);
        return Ok(result);
    }
}
