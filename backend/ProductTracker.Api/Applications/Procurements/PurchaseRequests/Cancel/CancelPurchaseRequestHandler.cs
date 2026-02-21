using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;
using ProductTracker.Api.Domain.Entities;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Cancel;

public sealed class CancelPurchaseRequestHandler
{
    private readonly AppDbContext _db;

    public CancelPurchaseRequestHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PurchaseRequestResponse> HandleAsync(
        Guid id,
        CancelPurchaseRequestRequest request,
        CancellationToken ct = default
    )
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

        if (entity.Status != PurchaseRequestStatus.Submitted)
        {
            throw new Exception("Sadece gönderilmiş talepler iptal edilebilir.");
        }

        entity.Status = PurchaseRequestStatus.Cancelled;

        await _db.SaveChangesAsync(ct);

        return PurchaseRequestResponseMapper.ToResponse(entity);
    }
}
