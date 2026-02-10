using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.WareHouses.Update;

public static class UpdateWareHouseMapper
{
    public static void Apply(UpdateWareHouseRequest request, WareHouse entity)
    {
        entity.Name = request.Name.Trim();
    }
}
