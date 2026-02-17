using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.Units.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.Units.List;

public sealed class ListUnitsHandler
{
    private readonly AppDbContext _db;

    public ListUnitsHandler(AppDbContext db) => _db = db;

    public async Task<List<UnitResponse>> HandleAsync(CancellationToken ct = default)
    {
        return await _db.Units
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Select(x => new UnitResponse { Id = x.Id, Code = x.Code, Name = x.Name })
            .ToListAsync(ct);
    }
}
