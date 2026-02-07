namespace ProductTracker.Api.Domain.Entities;

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string? Sku { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int StatusId { get; set; }
    public ProductStatus Status { get; set; } = null!;
}
