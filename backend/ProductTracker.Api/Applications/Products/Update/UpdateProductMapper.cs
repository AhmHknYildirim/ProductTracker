using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Products.Update;

public static class UpdateProductMapper
{
    public static void Apply(UpdateProductRequest req, Product p)
    {
        p.Name = req.Name.Trim();
        p.Sku = string.IsNullOrWhiteSpace(req.Sku) ? null : req.Sku.Trim();
        p.Quantity = req.Quantity;
    }
}
