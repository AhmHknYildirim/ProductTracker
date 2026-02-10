using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.Update;

public sealed class UpdateProductRules
{
    private readonly AppDbContext _db;

    public UpdateProductRules(AppDbContext db) => _db = db;

    public async Task EnsureSkuUniqueAsync(Guid productId, string? sku, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(sku))
            return;

        var normalized = sku.Trim();

        var exists = await _db.Products.AnyAsync(x => x.Sku == normalized && x.Id != productId, ct);

        if (exists)
            throw new InvalidOperationException($"SKU already exists: {normalized}");
    }

    public async Task EnsureWareHouseExistsAsync(Guid? wareHouseId, CancellationToken ct)
    {
        if (wareHouseId is null)
            return;

        var exists = await _db.WareHouses.AnyAsync(x => x.Id == wareHouseId, ct);
        if (!exists)
            throw new InvalidOperationException("Warehouse not found.");
    }
}
