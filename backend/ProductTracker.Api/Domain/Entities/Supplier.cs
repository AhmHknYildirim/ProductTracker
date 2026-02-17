namespace ProductTracker.Api.Domain.Entities;

public sealed class Supplier
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;

    public string? TaxNumber { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
