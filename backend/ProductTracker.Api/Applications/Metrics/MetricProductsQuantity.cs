namespace ProductTracker.Api.Applications.Metrics;

public sealed class MetricProductsQuantity
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = default!;
    public int Quantity { get; set; }
}
