using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.Create;

public sealed class CreateWareHouseRules
{
    private readonly AppDbContext _db;

    public CreateWareHouseRules(AppDbContext db) => _db = db;

    public async Task EnsureNameUniqueAsync(string name, CancellationToken ct)
    {
        var normalized = name.Trim();
        var exists = await _db.WareHouses.AnyAsync(x => x.Name == normalized, ct);
        if (exists)
            throw new InvalidOperationException($"Warehouse already exists: {normalized}");
    }
}
