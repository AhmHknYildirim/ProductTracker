using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ProductTracker.Api.Applications.Users.Common;

public sealed class HttpContextCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public bool IsAuthenticated() => accessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

    public Guid GetUserId()
    {
        var userIdStr = accessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdStr))
            throw new InvalidOperationException("User is not authenticated.");

        return Guid.Parse(userIdStr);
    }
}
