namespace ProductTracker.Api.Applications.Users.Login;

public class LoginRequest
{
    public string UserName { get; set; } = default!;
    public string Password { get; set; } = default!;
}
