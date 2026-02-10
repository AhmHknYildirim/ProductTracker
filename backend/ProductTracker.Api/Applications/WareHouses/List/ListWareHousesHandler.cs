using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.WareHouses.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.List;

public sealed class ListWareHousesHandler
{
    private readonly AppDbContext _db;

    public ListWareHousesHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<WareHouseResponse>> HandleAsync(
        ListWareHousesQuery query,
        CancellationToken ct = default
    )
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 ? 20 : query.PageSize;
        if (pageSize > 100)
            pageSize = 100;

        IQueryable<Domain.Entities.WareHouse> q = _db.WareHouses.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var term = query.Q.Trim();
            q = q.Where(x => x.Name.Contains(term));
        }

        q = q.OrderBy(x => x.Name);

        var total = await q.LongCountAsync(ct);
        var warehouses = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<WareHouseResponse>
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = warehouses.Select(WareHouseResponseMapper.ToResponse).ToList(),
        };
    }
}
