using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.Products.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.Products.Update;

public sealed class UpdateProductHandler
{
    private readonly AppDbContext _db;
    private readonly UpdateProductRules _rules;
    private readonly IValidator<UpdateProductRequest> _validator;

    public UpdateProductHandler(
        AppDbContext db,
        UpdateProductRules rules,
        IValidator<UpdateProductRequest> validator
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
    }

    public async Task<ProductResponse> HandleAsync(
        Guid id,
        UpdateProductRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var entity = await _db.Products.FindAsync([id], ct);
        if (entity is null)
            throw new KeyNotFoundException("Product not found.");

        var normalizedSku = string.IsNullOrWhiteSpace(request.Sku) ? null : request.Sku.Trim();

        await _rules.EnsureSkuUniqueAsync(entity.Id, normalizedSku, ct);

        UpdateProductMapper.Apply(request, entity);

        await _db.SaveChangesAsync(ct);

        return ProductResponseMapper.ToResponse(entity);
    }
}
