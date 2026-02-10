using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Metrics;

public sealed class MetricProductsQuantityHandler
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public MetricProductsQuantityHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<MetricProductsQuantity>> HandleAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetUserId();

        return await _db
            .Products.AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.Name)
            .Select(p => new MetricProductsQuantity
            {
                ProductId = p.Id,
                Name = p.Name,
                Quantity = p.Quantity,
            })
            .ToListAsync(ct);
    }
}
