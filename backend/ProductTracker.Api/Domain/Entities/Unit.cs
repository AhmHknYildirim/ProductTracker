namespace ProductTracker.Api.Domain.Entities;

public sealed class Unit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
