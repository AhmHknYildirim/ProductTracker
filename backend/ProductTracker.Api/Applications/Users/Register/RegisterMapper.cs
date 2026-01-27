using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Users.Register;

public static class RegisterMapper
{
    public static User ToEntity(RegisterRequest req, string passwordHash)
    {
        return new User
        {
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            MiddleName = string.IsNullOrWhiteSpace(req.MiddleName) ? null : req.MiddleName.Trim(),

            UserName = req.UserName.Trim(),
            Email = req.Email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
        };
    }
}
