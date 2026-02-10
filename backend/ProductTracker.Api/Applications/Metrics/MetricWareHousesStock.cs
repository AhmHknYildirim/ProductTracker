namespace ProductTracker.Api.Applications.Metrics;

public sealed class MetricWareHousesStock
{
    public Guid WareHouseId { get; set; }
    public string Name { get; set; } = default!;
    public int TotalQuantity { get; set; }
}
