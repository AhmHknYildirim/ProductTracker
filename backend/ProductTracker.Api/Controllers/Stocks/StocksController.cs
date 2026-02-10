using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Stocks.Create;
using ProductTracker.Api.Applications.Stocks.Delete;
using ProductTracker.Api.Applications.Stocks.List;
using ProductTracker.Api.Applications.Stocks.Update;
using ProductTracker.Api.Applications.Users.Common;

namespace ProductTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/stocks")]
public sealed class StocksController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateStockRequest request,
        [FromServices] CreateStockHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(request, ct);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateStockRequest request,
        [FromServices] UpdateStockHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, request, ct);
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] ListStocksQuery query,
        [FromServices] ListStocksHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(query, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromServices] DeleteStockHandler handler,
        [FromServices] ICurrentUser currentUser,
        CancellationToken ct
    )
    {
        await handler.HandleAsync(new DeleteStockRequest { StockId = id }, currentUser, ct);
        return NoContent();
    }
}
