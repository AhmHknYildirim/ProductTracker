using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.Delete;

public sealed class DeleteStockRules
{
    private readonly AppDbContext _db;

    public DeleteStockRules(AppDbContext db) => _db = db;

    public async Task EnsureCanDeleteAsync(Guid stockId, Guid userId, CancellationToken ct)
    {
        var exists = await _db.Stocks
            .AsNoTracking()
            .Include(s => s.Product)
            .AnyAsync(s => s.Id == stockId && s.Product.UserId == userId, ct);

        if (!exists)
            throw new InvalidOperationException("Stock not found.");
    }
}
