using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;

public sealed class CreatePurchaseRequestHandler
{
    private readonly AppDbContext _db;
    private readonly CreatePurchaseRequestRules _rules;
    private readonly IValidator<CreatePurchaseRequestRequest> _validator;
    private readonly ICurrentUser _currentUser;

    public CreatePurchaseRequestHandler(
        AppDbContext db,
        CreatePurchaseRequestRules rules,
        IValidator<CreatePurchaseRequestRequest> validator,
        ICurrentUser currentUser
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
        _currentUser = currentUser;
    }

    public async Task<PurchaseRequestResponse> HandleAsync(
        CreatePurchaseRequestRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        await _rules.EnsureProductsExistAsync(request.Lines.Select(x => x.ProductId), ct);
        await _rules.EnsureUnitsExistAsync(request.Lines.Select(x => x.UnitId), ct);

        var userId = _currentUser.GetUserId();
        var requestNumber = await _rules.GenerateRequestNumberAsync(ct);
        var entity = CreatePurchaseRequestMapper.ToEntity(request, userId, requestNumber);

        _db.PurchaseRequests.Add(entity);
        await _db.SaveChangesAsync(ct);

        var created = await _db.PurchaseRequests
            .AsNoTracking()
            .Include(x => x.Lines)
            .ThenInclude(l => l.Product)
            .Include(x => x.Lines)
            .ThenInclude(l => l.Unit)
            .FirstAsync(x => x.Id == entity.Id, ct);

        return PurchaseRequestResponseMapper.ToResponse(created);
    }
}
