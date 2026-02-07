using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Products.Common;

public static class ProductResponseMapper
{
    public static ProductResponse ToResponse(Product p) =>
        new()
        {
            Id = p.Id,
            Name = p.Name,
            Sku = p.Sku,
            Quantity = p.Quantity,
            Status = (ProductStatusKind)p.StatusId,
            CreatedAt = p.CreatedAt,
        };
}
