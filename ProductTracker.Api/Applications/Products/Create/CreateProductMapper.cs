using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Application.Products.Create;

public static class CreateProductMapper
{
    public static Product ToEntity(CreateProductRequest req) => new()
    {
        Name = req.Name.Trim(),
        Sku = string.IsNullOrWhiteSpace(req.Sku) ? null : req.Sku.Trim(),
        Quantity = req.Quantity
    };
}