using FluentValidation;
using ProductTracker.Api.Applications.WareHouses.Common;
using ProductTracker.Api.Infrastructure.Persistence;

namespace ProductTracker.Api.Applications.WareHouses.Create;

public sealed class CreateWareHouseHandler
{
    private readonly AppDbContext _db;
    private readonly CreateWareHouseRules _rules;
    private readonly IValidator<CreateWareHouseRequest> _validator;

    public CreateWareHouseHandler(
        AppDbContext db,
        CreateWareHouseRules rules,
        IValidator<CreateWareHouseRequest> validator
    )
    {
        _db = db;
        _rules = rules;
        _validator = validator;
    }

    public async Task<WareHouseResponse> HandleAsync(
        CreateWareHouseRequest request,
        CancellationToken ct = default
    )
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        await _rules.EnsureNameUniqueAsync(request.Name, ct);

        var entity = CreateWareHouseMapper.ToEntity(request);
        _db.WareHouses.Add(entity);
        await _db.SaveChangesAsync(ct);

        return WareHouseResponseMapper.ToResponse(entity);
    }
}
