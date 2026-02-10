using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Stocks.Common;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.Create;

public sealed class CreateStockHandler
{
    private readonly AppDbContext _db;
    private readonly CreateStockRules _rules;
    private readonly IValidator<CreateStockRequest> _validator;
    private readonly ICurrentUser _currentUser;

    public CreateStockHandler(
        AppDbContext db,
        CreateStockRules rules,
        IValidator<CreateStockRequest> validator,
        ICurrentUser currentUser
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
        _currentUser = currentUser;
    }

    public async Task<StockResponse> HandleAsync(
        CreateStockRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var userId = _currentUser.GetUserId();

        await _rules.EnsureProductExistsAsync(request.ProductId, userId, ct);
        await _rules.EnsureWareHouseExistsAsync(request.WareHouseId, ct);
        await _rules.EnsureStockUniqueAsync(request.ProductId, request.WareHouseId, ct);

        var entity = CreateStockMapper.ToEntity(request);

        _db.Stocks.Add(entity);
        await _db.SaveChangesAsync(ct);

        var stock = await _db.Stocks
            .AsNoTracking()
            .Include(s => s.Product)
            .Include(s => s.WareHouse)
            .FirstAsync(s => s.Id == entity.Id, ct);

        return StockResponseMapper.ToResponse(stock);
    }
}
