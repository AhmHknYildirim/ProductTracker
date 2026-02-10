using ProductTracker.Api.Applications.Products.Common;

namespace ProductTracker.Api.Applications.Products.Update;

public class UpdateProductRequest
{
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public string Revision { get; set; } = default!;
    public int Quantity { get; set; }
    public Guid? WareHouseId { get; set; }
    public ProductStatusKind Status { get; set; } = ProductStatusKind.Active;
}

