using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.Update;

public sealed class UpdateWareHouseRules
{
    private readonly AppDbContext _db;

    public UpdateWareHouseRules(AppDbContext db) => _db = db;

    public async Task EnsureNameUniqueAsync(Guid id, string name, CancellationToken ct)
    {
        var normalized = name.Trim();
        var exists = await _db.WareHouses.AnyAsync(x => x.Id != id && x.Name == normalized, ct);
        if (exists)
            throw new InvalidOperationException($"Warehouse already exists: {normalized}");
    }
}
