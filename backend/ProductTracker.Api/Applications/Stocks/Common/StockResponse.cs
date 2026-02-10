namespace ProductTracker.Api.Applications.Stocks.Common;

public sealed class StockResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public string? ProductSku { get; set; }
    public Guid WareHouseId { get; set; }
    public string WareHouseName { get; set; } = default!;
    public int Quantity { get; set; }
}
