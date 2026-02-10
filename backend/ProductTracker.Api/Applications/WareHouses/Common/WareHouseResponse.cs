namespace ProductTracker.Api.Applications.WareHouses.Common;

public sealed class WareHouseResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
}
