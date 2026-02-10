using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Applications.WareHouses.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.Update;

public sealed class UpdateWareHouseHandler
{
    private readonly AppDbContext _db;
    private readonly UpdateWareHouseRules _rules;
    private readonly IValidator<UpdateWareHouseRequest> _validator;

    public UpdateWareHouseHandler(
        AppDbContext db,
        UpdateWareHouseRules rules,
        IValidator<UpdateWareHouseRequest> validator
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
    }

    public async Task<WareHouseResponse> HandleAsync(
        Guid id,
        UpdateWareHouseRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var entity = await _db.WareHouses.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            throw new KeyNotFoundException("Warehouse not found.");

        await _rules.EnsureNameUniqueAsync(id, request.Name, ct);

        UpdateWareHouseMapper.Apply(request, entity);
        await _db.SaveChangesAsync(ct);

        return WareHouseResponseMapper.ToResponse(entity);
    }
}
