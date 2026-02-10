namespace ProductTracker.Api.Applications.Stocks.List;

public sealed class ListStocksQuery
{
    public Guid? ProductId { get; set; }
    public Guid? WareHouseId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
