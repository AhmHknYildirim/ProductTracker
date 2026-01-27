using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Users.Register;

public sealed class RegisterRules
{
    private readonly AppDbContext _db;

    public RegisterRules(AppDbContext db) => _db = db;

    public async Task EnsureUsernameAndEmailUniqueAsync(
        string username,
        string email,
        CancellationToken ct
    )
    {
        var exists = await _db.Users.AnyAsync(x => x.UserName == username || x.Email == email, ct);

        if (exists)
            throw new InvalidOperationException("Username or email already exists.");
    }
}
