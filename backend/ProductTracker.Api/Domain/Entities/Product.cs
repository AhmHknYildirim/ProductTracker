namespace ProductTracker.Api.Domain.Entities;

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public string Revision { get; set; } = default!;
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? WareHouseId { get; set; }
    public WareHouse? WareHouse { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int StatusId { get; set; }
    public ProductStatus Status { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
}
