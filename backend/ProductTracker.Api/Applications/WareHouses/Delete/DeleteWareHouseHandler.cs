using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.Delete;

public sealed class DeleteWareHouseHandler
{
    private readonly AppDbContext _db;
    private readonly DeleteWareHouseRules _rules;

    public DeleteWareHouseHandler(AppDbContext db, DeleteWareHouseRules rules)
    {
        _db = db;
        _rules = rules;
    }

    public async Task HandleAsync(
        DeleteWareHouseRequest request,
        CancellationToken ct = default
    )
    {
        await _rules.EnsureCanDeleteAsync(request.WareHouseId, ct);

        await _db.WareHouses
            .Where(x => x.Id == request.WareHouseId)
            .ExecuteDeleteAsync(ct);
    }
}
