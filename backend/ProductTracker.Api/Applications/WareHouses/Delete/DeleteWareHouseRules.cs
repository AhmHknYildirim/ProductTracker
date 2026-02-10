using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.Delete;

public sealed class DeleteWareHouseRules
{
    private readonly AppDbContext _db;

    public DeleteWareHouseRules(AppDbContext db) => _db = db;

    public async Task EnsureCanDeleteAsync(Guid wareHouseId, CancellationToken ct)
    {
        var exists = await _db.WareHouses.AnyAsync(x => x.Id == wareHouseId, ct);
        if (!exists)
            throw new InvalidOperationException("Warehouse not found.");

        var hasStock = await _db.Stocks.AnyAsync(x => x.WareHouseId == wareHouseId, ct);
        if (hasStock)
            throw new InvalidOperationException("Cannot delete warehouse with existing stock.");
    }
}
