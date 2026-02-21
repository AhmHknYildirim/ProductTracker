using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;
using ProductTracker.Api.Domain.Entities;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Reject;

public sealed class RejectPurchaseRequestHandler
{
    private readonly AppDbContext _db;

    public RejectPurchaseRequestHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PurchaseRequestResponse> HandleAsync(
        Guid id,
        RejectPurchaseRequestRequest request,
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
            throw new Exception("Sadece gönderilmiş talepler reddedilebilir.");
        }

        entity.Status = PurchaseRequestStatus.Rejected;
        entity.RejectionReason = request.RejectionReason;

        await _db.SaveChangesAsync(ct);

        return PurchaseRequestResponseMapper.ToResponse(entity);
    }
}
