namespace ProductTracker.Api.Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string FirstName { get; set; } = default!;
    
    public string LastName { get; set; } = default!;
    
    public string? MiddleName { get; set; }
    
    public string UserName { get; set; } = default!;
    
    public string Email { get; set; } = default!;
    
    public string PasswordHash { get; set; } = default!;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
