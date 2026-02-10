using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.WareHouses.Common;

public static class WareHouseResponseMapper
{
    public static WareHouseResponse ToResponse(WareHouse entity) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name,
        };
}
