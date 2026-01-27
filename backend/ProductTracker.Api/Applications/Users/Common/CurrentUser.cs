using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ProductTracker.Api.Applications.Users.Common;

public sealed class CurrentUser(IHttpContextAccessor accessor)
{
    public Guid GetUserId()
    {
        var id = accessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(id!);
    }
}
