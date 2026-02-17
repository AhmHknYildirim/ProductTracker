using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductTracker.Api.Applications.Products.Create;
using ProductTracker.Api.Applications.Products.Delete;
using ProductTracker.Api.Applications.Products.GetById;
using ProductTracker.Api.Applications.Products.List;
using ProductTracker.Api.Applications.Products.Update;
using ProductTracker.Api.Applications.Users.Common;

namespace ProductTracker.Api.Controllers.Products;

[Authorize]
[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequest request,
        [FromServices] CreateProductHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateProductRequest request,
        [FromServices] UpdateProductHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, request, ct);
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] ListProductsQuery query,
        [FromServices] ListProductsHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        [FromServices] GetProductByIdHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.HandleAsync(id, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromServices] DeleteProductHandler handler,
        [FromServices] ICurrentUser currentUser,
        CancellationToken ct
    )
    {
        await handler.HandleAsync(new DeleteProductRequest { ProductId = id }, currentUser, ct);

        return NoContent();
    }
}
