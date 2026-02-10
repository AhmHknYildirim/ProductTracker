using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Stocks.Common;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.List;

public sealed class ListStocksHandler
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ListStocksHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<StockResponse>> HandleAsync(
        ListStocksQuery query,
        CancellationToken ct = default
    )
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 ? 20 : query.PageSize;
        if (pageSize > 100)
            pageSize = 100;

        var userId = _currentUser.GetUserId();

        var q = _db.Stocks
            .AsNoTracking()
            .Include(s => s.Product)
            .Include(s => s.WareHouse)
            .Where(s => s.Product.UserId == userId)
            .AsQueryable();

        if (query.ProductId is not null)
            q = q.Where(s => s.ProductId == query.ProductId.Value);

        if (query.WareHouseId is not null)
            q = q.Where(s => s.WareHouseId == query.WareHouseId.Value);

        q = q
            .OrderBy(s => s.WareHouse.Name)
            .ThenBy(s => s.Product.Name);

        var total = await q.LongCountAsync(ct);
        var stocks = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<StockResponse>
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = stocks.Select(StockResponseMapper.ToResponse).ToList(),
        };
    }
}
