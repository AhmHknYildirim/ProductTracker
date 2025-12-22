using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Application.Products.Create;

public sealed class CreateProductRules
{
    private readonly AppDbContext _db;

    public CreateProductRules(AppDbContext db) => _db = db;

    public async Task EnsureSkuUniqueAsync(string? sku, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(sku))
            return;

        var normalized = sku.Trim();
        var exists = await _db.Products.AnyAsync(x => x.Sku == normalized, ct);
        if (exists)
            throw new InvalidOperationException($"SKU already exists: {normalized}");
    }
}