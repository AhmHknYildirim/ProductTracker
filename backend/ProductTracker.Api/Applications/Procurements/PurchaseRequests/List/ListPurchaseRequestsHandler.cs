using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.Common;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.List;

public sealed class ListPurchaseRequestsHandler
{
    private readonly AppDbContext _db;

    public ListPurchaseRequestsHandler(AppDbContext db) => _db = db;

    private static DateTime? AsUtc(DateTime? value)
        => value.HasValue
            ? (value.Value.Kind == DateTimeKind.Utc
                ? value.Value
                : DateTime.SpecifyKind(value.Value, DateTimeKind.Utc))
            : null;

    public async Task<PagedResult<PurchaseRequestResponse>> HandleAsync(
        ListPurchaseRequestsQuery query,
        CancellationToken ct = default
    )
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 ? 20 : query.PageSize;
        if (pageSize > 100)
            pageSize = 100;

        var q = _db.PurchaseRequests
            .AsNoTracking()
            .Include(x => x.Lines)
            .ThenInclude(l => l.Product)
            .Include(x => x.Lines)
            .ThenInclude(l => l.Unit)
            .Include(x => x.RequestedByUser)
            .AsQueryable();

        if (query.Status is not null)
            q = q.Where(x => x.Status == query.Status.Value);

        if (query.RequestedByUserId is not null)
            q = q.Where(x => x.RequestedByUserId == query.RequestedByUserId.Value);

        if (!string.IsNullOrWhiteSpace(query.UserName))
        {
            var userName = query.UserName.Trim();
            q = q.Where(x => x.RequestedByUser.UserName.Contains(userName));
        }

        var fromDateUtc = AsUtc(query.FromDate);
        var toDateUtc = AsUtc(query.ToDate);

        if (fromDateUtc is not null)
            q = q.Where(x => x.RequestDate >= fromDateUtc.Value);

        if (toDateUtc is not null)
            q = q.Where(x => x.RequestDate <= toDateUtc.Value);

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var term = query.Q.Trim();
            q = q.Where(x => x.RequestNumber.Contains(term) ||
                             (x.Description != null && x.Description.Contains(term)));
        }

        q = (query.Sort ?? "-createdAt").ToLowerInvariant() switch
        {
            "requestnumber" => q.OrderBy(x => x.RequestNumber),
            "-requestnumber" => q.OrderByDescending(x => x.RequestNumber),
            "requestdate" => q.OrderBy(x => x.RequestDate),
            "-requestdate" => q.OrderByDescending(x => x.RequestDate),
            "status" => q.OrderBy(x => x.Status),
            "-status" => q.OrderByDescending(x => x.Status),
            "createdat" => q.OrderBy(x => x.CreatedAt),
            _ => q.OrderByDescending(x => x.CreatedAt),
        };

        var total = await q.LongCountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<PurchaseRequestResponse>
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = items.Select(PurchaseRequestResponseMapper.ToResponse).ToList(),
        };
    }
}
