using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Products.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.Delete;

public sealed class DeleteProductRules
{
    private readonly AppDbContext _db;

    public DeleteProductRules(AppDbContext db)
    {
        _db = db;
    }

    public async Task EnsureCanDeleteAsync(Guid productId, Guid userId, CancellationToken ct)
    {
        var product = await _db
            .Products.AsNoTracking()
            .Where(x => x.Id == productId && x.UserId == userId)
            .Select(x => new
            {
                x.IsActive,
                x.StatusId,
                x.Quantity,
            })
            .FirstOrDefaultAsync(ct);

        if (product is null)
            throw new InvalidOperationException("Product not found.");

        if (!product.IsActive)
            throw new InvalidOperationException("Product already deleted.");

        if (product.StatusId == (int)ProductStatusKind.Archived)
            throw new InvalidOperationException("Cannot delete archived product.");

        if (product.Quantity >= 100)
            throw new InvalidOperationException("Cannot delete product with quantity 100 or more.");
    }
}
