using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Products.Create;

public static class CreateProductMapper
{
    public static Product ToEntity(CreateProductRequest req) =>
        new()
        {
            Name = req.Name.Trim(),
            Sku = string.IsNullOrWhiteSpace(req.Sku) ? null : req.Sku.Trim(),
            Revision = req.Revision.Trim(),
            Quantity = req.Quantity,
            WareHouseId = req.WareHouseId,
            StatusId = (int)req.Status,
        };
}
