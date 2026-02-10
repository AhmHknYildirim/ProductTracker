using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.Update;

public sealed class UpdateStockRules
{
    private readonly AppDbContext _db;

    public UpdateStockRules(AppDbContext db) => _db = db;

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
        Guid stockId,
        Guid productId,
        Guid wareHouseId,
        CancellationToken ct
    )
    {
        var exists = await _db.Stocks.AnyAsync(
            x => x.Id != stockId && x.ProductId == productId && x.WareHouseId == wareHouseId,
            ct
        );

        if (exists)
            throw new InvalidOperationException("Stock already exists for this product and warehouse.");
    }
}
