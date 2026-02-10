using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Metrics;

namespace ProductTracker.Api.Controllers.Metrics;

[Authorize]
[ApiController]
[Route("api/metrics")]
public sealed class MetricsController : ControllerBase
{
    [HttpGet("products-quantity")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductsQuantity(
        [FromServices] MetricProductsQuantityHandler handler,
        CancellationToken ct
    )
    {
        var items = await handler.HandleAsync(ct);
        return Ok(new { items });
    }

    [HttpGet("warehouse-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWareHousesStock(
        [FromServices] MetricWareHouseStockHandler handler,
        CancellationToken ct
    )
    {
        var items = await handler.HandleAsync(ct);
        return Ok(new { items });
    }
}
