using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Metrics;

public sealed class MetricWareHouseStockHandler
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public MetricWareHouseStockHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<MetricWareHousesStock>> HandleAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetUserId();

        return await _db
            .WareHouses.AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new MetricWareHousesStock
            {
                WareHouseId = p.Id,
                Name = p.Name,
                TotalQuantity = p.Stocks
                    .Where(s => s.Product.UserId == userId)
                    .Sum(s => (int?)s.Quantity) ?? 0,
            })
            .ToListAsync(ct);
    }
}
