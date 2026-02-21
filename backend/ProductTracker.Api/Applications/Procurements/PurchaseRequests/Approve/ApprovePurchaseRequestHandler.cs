using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Domain.Entities;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Approve;

public sealed class ApprovePurchaseRequestHandler
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ApprovePurchaseRequestHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
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

        if (entity.Status != PurchaseRequestStatus.Submitted)
        {
            throw new Exception("Sadece gönderilmiş talepler onaylanabilir.");
        }

        entity.Status = PurchaseRequestStatus.Approved;
        entity.ApprovedByUserId = _currentUser.GetUserId();
        entity.ApprovedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return PurchaseRequestResponseMapper.ToResponse(entity);
    }
}
