using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Stocks.Create;

public static class CreateStockMapper
{
    public static Stock ToEntity(CreateStockRequest req) =>
        new()
        {
            ProductId = req.ProductId,
            WareHouseId = req.WareHouseId,
            Quantity = req.Quantity,
        };
}
