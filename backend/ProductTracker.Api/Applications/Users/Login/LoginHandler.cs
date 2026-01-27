using FluentValidation;
using ProductTracker.Api.Applications.Users.Common;

namespace ProductTracker.Api.Applications.Users.Login;

public sealed class LoginHandler
{
    private readonly LoginRules _rules;
    private readonly IValidator<LoginRequest> _validator;
    private readonly JwtTokenService _jwt;

    public LoginHandler(LoginRules rules, IValidator<LoginRequest> validator, JwtTokenService jwt)
    {
        _rules = rules;
        _validator = validator;
        _jwt = jwt;
    }

    public async Task<LoginResponse> HandleAsync(LoginRequest request, CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var user = await _rules.GetUserAsync(request.UserName.Trim(), ct);
        _rules.EnsurePasswordValid(request.Password, user.PasswordHash);

        var token = _jwt.CreateAccessToken(user.Id, user.UserName);

        return new LoginResponse
        {
            UserId = user.Id,
            UserName = user.UserName,
            AccessToken = token,
        };
    }
}
