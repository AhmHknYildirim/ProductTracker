namespace ProductTracker.Api.Applications.Products.Common;

public sealed class ProductResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public string Revision { get; set; } = default!;
    public int Quantity { get; set; }
    public Guid? WareHouseId { get; set; }
    public ProductStatusKind Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
