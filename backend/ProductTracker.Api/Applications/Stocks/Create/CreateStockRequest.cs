namespace ProductTracker.Api.Applications.Stocks.Create;

public sealed class CreateStockRequest
{
    public Guid ProductId { get; set; }
    public Guid WareHouseId { get; set; }
    public int Quantity { get; set; }
}
