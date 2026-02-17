namespace ProductTracker.Api.Applications.Stocks.Update;

public sealed class UpdateStockRequest
{
    public Guid ProductId { get; set; }
    public Guid WareHouseId { get; set; }
    public decimal Quantity { get; set; }
}
