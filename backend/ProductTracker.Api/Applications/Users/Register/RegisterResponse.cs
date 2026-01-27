namespace ProductTracker.Api.Applications.Users.Register;

public sealed class RegisterResponse
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = default!;
    public string AccessToken { get; set; } = default!;
}
