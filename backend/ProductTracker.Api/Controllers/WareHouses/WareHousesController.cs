using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.WareHouses.Create;
using ProductTracker.Api.Applications.WareHouses.Delete;
using ProductTracker.Api.Applications.WareHouses.List;
using ProductTracker.Api.Applications.WareHouses.Update;

namespace ProductTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/warehouses")]
public sealed class WareHousesController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateWareHouseRequest request,
        [FromServices] CreateWareHouseHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(request, ct);
        return CreatedAtAction(nameof(List), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateWareHouseRequest request,
        [FromServices] UpdateWareHouseHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, request, ct);
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] ListWareHousesQuery query,
        [FromServices] ListWareHousesHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(query, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromServices] DeleteWareHouseHandler handler,
        CancellationToken ct
    )
    {
        await handler.HandleAsync(new DeleteWareHouseRequest { WareHouseId = id }, ct);
        return NoContent();
    }
}
