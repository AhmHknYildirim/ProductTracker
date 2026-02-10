namespace ProductTracker.Api.Domain.Entities;

public sealed class WareHouse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
