using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Stocks.Common;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Stocks.Update;

public sealed class UpdateStockHandler
{
    private readonly AppDbContext _db;
    private readonly UpdateStockRules _rules;
    private readonly IValidator<UpdateStockRequest> _validator;
    private readonly ICurrentUser _currentUser;

    public UpdateStockHandler(
        AppDbContext db,
        UpdateStockRules rules,
        IValidator<UpdateStockRequest> validator,
        ICurrentUser currentUser
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
        _currentUser = currentUser;
    }

    public async Task<StockResponse> HandleAsync(
        Guid id,
        UpdateStockRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var userId = _currentUser.GetUserId();

        var entity = await _db.Stocks
            .Include(s => s.Product)
            .FirstOrDefaultAsync(s => s.Id == id && s.Product.UserId == userId, ct);
        if (entity is null)
            throw new KeyNotFoundException("Stock not found.");

        await _rules.EnsureProductExistsAsync(request.ProductId, userId, ct);
        await _rules.EnsureWareHouseExistsAsync(request.WareHouseId, ct);
        await _rules.EnsureStockUniqueAsync(id, request.ProductId, request.WareHouseId, ct);

        UpdateStockMapper.Apply(request, entity);

        await _db.SaveChangesAsync(ct);

        var updated = await _db.Stocks
            .AsNoTracking()
            .Include(s => s.Product)
            .Include(s => s.WareHouse)
            .FirstAsync(s => s.Id == id, ct);

        return StockResponseMapper.ToResponse(updated);
    }
}
