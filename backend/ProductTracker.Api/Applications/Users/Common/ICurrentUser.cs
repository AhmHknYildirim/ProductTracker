namespace ProductTracker.Api.Applications.Users.Common;

public interface ICurrentUser
{
    Guid GetUserId();
    bool IsAuthenticated();
}
