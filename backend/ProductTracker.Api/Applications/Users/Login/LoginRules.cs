using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Domain.Entities;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Users.Login;

public sealed class LoginRules
{
    private readonly AppDbContext _db;

    public LoginRules(AppDbContext db) => _db = db;

    public async Task<User> GetUserAsync(string username, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserName == username, ct);

        if (user is null)
            throw new InvalidOperationException("Username or password is incorrect.");

        return user;
    }

    public void EnsurePasswordValid(string password, string passwordHash)
    {
        if (!BCrypt.Net.BCrypt.Verify(password, passwordHash))
            throw new InvalidOperationException("Username or password is incorrect.");
    }
}
