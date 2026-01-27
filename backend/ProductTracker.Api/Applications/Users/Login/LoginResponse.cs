namespace ProductTracker.Api.Applications.Users.Login;

public sealed class LoginResponse
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = default!;
    public string AccessToken { get; set; } = default!;
}
