using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Stocks.Update;

public static class UpdateStockMapper
{
    public static void Apply(UpdateStockRequest req, Stock entity)
    {
        entity.ProductId = req.ProductId;
        entity.WareHouseId = req.WareHouseId;
        entity.Quantity = req.Quantity;
    }
}
