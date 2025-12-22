namespace ProductTracker.Api.Application.Products.Common;

public sealed class ProductResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}