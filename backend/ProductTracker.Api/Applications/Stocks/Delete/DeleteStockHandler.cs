using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.Delete;

public sealed class DeleteStockHandler
{
    private readonly AppDbContext _db;
    private readonly DeleteStockRules _rules;

    public DeleteStockHandler(AppDbContext db, DeleteStockRules rules)
    {
        _db = db;
        _rules = rules;
    }

    public async Task HandleAsync(
        DeleteStockRequest request,
        ICurrentUser currentUser,
        CancellationToken ct = default
    )
    {
        var userId = currentUser.GetUserId();
        await _rules.EnsureCanDeleteAsync(request.StockId, userId, ct);

        await _db.Stocks
            .Where(s => s.Id == request.StockId)
            .ExecuteDeleteAsync(ct);
    }
}
