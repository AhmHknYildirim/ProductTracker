using FluentValidation;
using ProductTracker.Api.Application.Products.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Application.Products.Create;

public sealed class CreateProductHandler
{
    private readonly AppDbContext _db;
    private readonly CreateProductRules _rules;
    private readonly IValidator<CreateProductRequest> _validator;

    public CreateProductHandler(
        AppDbContext db,
        CreateProductRules rules,
        IValidator<CreateProductRequest> validator)
    {
        _db = db;
        _rules = rules;
        _validator = validator;
    }

    public async Task<ProductResponse> HandleAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        await _rules.EnsureSkuUniqueAsync(request.Sku, ct);

        var entity = CreateProductMapper.ToEntity(request);

        _db.Products.Add(entity);
        await _db.SaveChangesAsync(ct);

        return ProductResponseMapper.ToResponse(entity);
    }
}