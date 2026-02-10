using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.Delete;

public sealed class DeleteProductHandler
{
    private readonly AppDbContext _db;
    private readonly DeleteProductRules _rules;

    public DeleteProductHandler(AppDbContext db, DeleteProductRules rules)
    {
        _db = db;
        _rules = rules;
    }

    public async Task HandleAsync(
        DeleteProductRequest request,
        ICurrentUser currentUser,
        CancellationToken ct = default
    )
    {
        var userId = currentUser.GetUserId();

        await _rules.EnsureCanDeleteAsync(request.ProductId, userId, ct);

        await _db
            .Products.Where(x => x.Id == request.ProductId && x.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false), ct);
    }
}
