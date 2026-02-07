namespace ProductTracker.Api.Domain.Entities;

public sealed class ProductStatus
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
