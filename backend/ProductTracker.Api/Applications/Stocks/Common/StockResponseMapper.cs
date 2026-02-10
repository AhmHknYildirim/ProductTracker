using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Stocks.Common;

public static class StockResponseMapper
{
    public static StockResponse ToResponse(Stock stock) =>
        new()
        {
            Id = stock.Id,
            ProductId = stock.ProductId,
            ProductName = stock.Product.Name,
            ProductSku = stock.Product.Sku,
            WareHouseId = stock.WareHouseId,
            WareHouseName = stock.WareHouse.Name,
            Quantity = stock.Quantity,
        };
}
