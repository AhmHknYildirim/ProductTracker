using FluentValidation;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Users.Register;

public sealed class RegisterHandler
{
    private readonly AppDbContext _db;
    private readonly RegisterRules _rules;
    private readonly IValidator<RegisterRequest> _validator;
    private readonly JwtTokenService _jwt;

    public RegisterHandler(
        AppDbContext db,
        RegisterRules rules,
        IValidator<RegisterRequest> validator,
        JwtTokenService jwt
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
        _jwt = jwt;
    }

    public async Task<RegisterResponse> HandleAsync(RegisterRequest request, CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var username = request.UserName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        await _rules.EnsureUsernameAndEmailUniqueAsync(username, email, ct);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = RegisterMapper.ToEntity(request, passwordHash);

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var token = _jwt.CreateAccessToken(user.Id, user.UserName);

        return new RegisterResponse
        {
            UserId = user.Id,
            UserName = user.UserName,
            AccessToken = token,
        };
    }
}
