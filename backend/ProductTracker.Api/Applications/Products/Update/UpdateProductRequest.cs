namespace ProductTracker.Api.Applications.Products.Update;

public class UpdateProductRequest
{
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public int Quantity { get; set; }
}
