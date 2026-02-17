using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;

public sealed class CreatePurchaseRequestRules
{
    private readonly AppDbContext _db;

    public CreatePurchaseRequestRules(AppDbContext db) => _db = db;

    public async Task<string> GenerateRequestNumberAsync(CancellationToken ct)
    {
        const string prefix = "PR-";

        for (var i = 0; i < 100; i++)
        {
            var lastNumber = await _db.PurchaseRequests
                .Where(x => x.RequestNumber.StartsWith(prefix))
                .OrderByDescending(x => x.RequestNumber)
                .Select(x => x.RequestNumber)
                .FirstOrDefaultAsync(ct);

            var next = 1;
            if (!string.IsNullOrWhiteSpace(lastNumber) &&
                lastNumber.Length >= prefix.Length + 6 &&
                int.TryParse(lastNumber.Substring(prefix.Length, 6), out var parsed))
            {
                next = parsed + 1;
            }

            if (next > 999_999)
                throw new InvalidOperationException("Request number sequence exceeded PR-999999.");

            var candidate = $"{prefix}{next:000000}";
            var exists = await _db.PurchaseRequests.AnyAsync(x => x.RequestNumber == candidate, ct);
            if (!exists)
                return candidate;
        }

        throw new InvalidOperationException("Could not generate a unique request number.");
    }

    public async Task EnsureProductsExistAsync(IEnumerable<Guid> productIds, CancellationToken ct)
    {
        var ids = productIds.Distinct().ToList();
        if (ids.Count == 0)
            return;

        var existingCount = await _db.Products.CountAsync(x => ids.Contains(x.Id), ct);
        if (existingCount != ids.Count)
            throw new InvalidOperationException("One or more products were not found.");
    }

    public async Task EnsureUnitsExistAsync(IEnumerable<Guid> unitIds, CancellationToken ct)
    {
        var ids = unitIds.Distinct().ToList();
        if (ids.Count == 0)
            return;

        var existingCount = await _db.Units.CountAsync(x => ids.Contains(x.Id), ct);
        if (existingCount != ids.Count)
            throw new InvalidOperationException("One or more units were not found.");
    }
}
