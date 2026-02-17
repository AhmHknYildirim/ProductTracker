namespace ProductTracker.Api.Domain.Entities;

public sealed class Stock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid WareHouseId { get; set; }
    public WareHouse WareHouse { get; set; } = null!;
    public decimal Quantity { get; set; }
}
