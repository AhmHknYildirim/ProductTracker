namespace ProductTracker.Api.Applications.Products.Create;

public sealed class CreateProductRequest
{
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public int Quantity { get; set; }
}
