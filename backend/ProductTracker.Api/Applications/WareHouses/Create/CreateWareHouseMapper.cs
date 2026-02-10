using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.WareHouses.Create;

public static class CreateWareHouseMapper
{
    public static WareHouse ToEntity(CreateWareHouseRequest request) =>
        new()
        {
            Name = request.Name.Trim(),
        };
}
