using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;
using ProductTracker.Api.Domain.Entities;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Submit;

public sealed class SubmitPurchaseRequestHandler
{
    private readonly AppDbContext _db;

    public SubmitPurchaseRequestHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PurchaseRequestResponse> HandleAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db
            .PurchaseRequests.Include(x => x.Lines)
            .ThenInclude(l => l.Product)
            .Include(x => x.Lines)
            .ThenInclude(l => l.Unit)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity == null)
        {
            throw new Exception("Satın alma talebi bulunamadı.");
        }

        if (entity.Status != PurchaseRequestStatus.Draft)
        {
            throw new Exception("Sadece taslak aşamasındaki talepler gönderilebilir.");
        }

        entity.Status = PurchaseRequestStatus.Submitted;
        entity.SubmittedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return PurchaseRequestResponseMapper.ToResponse(entity);
    }
}
