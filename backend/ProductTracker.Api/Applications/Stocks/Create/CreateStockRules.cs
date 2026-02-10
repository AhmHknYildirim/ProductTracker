using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.Create;

public sealed class CreateStockRules
{
    private readonly AppDbContext _db;

    public CreateStockRules(AppDbContext db) => _db = db;

    public async Task EnsureProductExistsAsync(Guid productId, Guid userId, CancellationToken ct)
    {
        var exists = await _db.Products.AnyAsync(
            x => x.Id == productId && x.UserId == userId,
            ct
        );

        if (!exists)
            throw new InvalidOperationException("Product not found.");
    }

    public async Task EnsureWareHouseExistsAsync(Guid wareHouseId, CancellationToken ct)
    {
        var exists = await _db.WareHouses.AnyAsync(x => x.Id == wareHouseId, ct);
        if (!exists)
            throw new InvalidOperationException("Warehouse not found.");
    }

    public async Task EnsureStockUniqueAsync(
        Guid productId,
        Guid wareHouseId,
        CancellationToken ct
    )
    {
        var exists = await _db.Stocks.AnyAsync(
            x => x.ProductId == productId && x.WareHouseId == wareHouseId,
            ct
        );

        if (exists)
            throw new InvalidOperationException("Stock already exists for this product and warehouse.");
    }
}
