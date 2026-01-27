using FluentValidation;
using ProductTracker.Api.Applications.Products.Common;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.Create;

public sealed class CreateProductHandler
{
    private readonly AppDbContext _db;
    private readonly CreateProductRules _rules;
    private readonly IValidator<CreateProductRequest> _validator;
    private readonly ICurrentUser _currentUser;

    public CreateProductHandler(
        AppDbContext db,
        CreateProductRules rules,
        IValidator<CreateProductRequest> validator,
        ICurrentUser currentUser
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
        _currentUser = currentUser;
    }

    public async Task<ProductResponse> HandleAsync(
        CreateProductRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        await _rules.EnsureSkuUniqueAsync(request.Sku, ct);

        var userId = _currentUser.GetUserId();

        var entity = CreateProductMapper.ToEntity(request);
        entity.UserId = userId;

        _db.Products.Add(entity);
        await _db.SaveChangesAsync(ct);

        return ProductResponseMapper.ToResponse(entity);
    }
}
