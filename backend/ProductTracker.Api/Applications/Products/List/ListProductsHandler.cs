using System.Linq;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Products.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.List;

public sealed class ListProductsHandler
{
    private readonly AppDbContext _db;

    public ListProductsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ProductResponse>> HandleAsync(
        ListProductsQuery query,
        CancellationToken ct = default
    )
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 ? 20 : query.PageSize;
        if (pageSize > 100)
            pageSize = 100;

        IQueryable<Domain.Entities.Product> q = _db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Sku))
        {
            var sku = query.Sku.Trim();
            q = q.Where(x => x.Sku == sku);
        }

        if (query.MinQty is not null)
            q = q.Where(x => x.Quantity >= query.MinQty.Value);

        if (query.MaxQty is not null)
            q = q.Where(x => x.Quantity <= query.MaxQty.Value);

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var term = query.Q.Trim();
            q = q.Where(x => x.Name.Contains(term) || (x.Sku != null && x.Sku.Contains(term)));
        }

        q = (query.Sort ?? "-createdAt").ToLowerInvariant() switch
        {
            "name" => q.OrderBy(x => x.Name),
            "-name" => q.OrderByDescending(x => x.Name),
            "createdat" => q.OrderBy(x => x.CreatedAt),
            _ => q.OrderByDescending(x => x.CreatedAt),
        };

        var total = await q.LongCountAsync(ct);

        var products = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        var items = products.Select(ProductResponseMapper.ToResponse).ToList();

        return new PagedResult<ProductResponse>
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = items,
        };
    }
}
