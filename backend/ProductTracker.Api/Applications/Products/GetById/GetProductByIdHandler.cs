using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Products.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.GetById;

public sealed class GetProductByIdHandler
{
    private readonly AppDbContext _db;

    public GetProductByIdHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProductResponse> HandleAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity is null)
            throw new KeyNotFoundException("Product not found.");

        return ProductResponseMapper.ToResponse(entity);
    }
}
