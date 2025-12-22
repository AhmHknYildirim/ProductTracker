using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Application.Products.Common;

public static class ProductResponseMapper
{
    public static ProductResponse ToResponse(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Sku = p.Sku,
        Quantity = p.Quantity,
        CreatedAt = p.CreatedAt
    };
}