namespace ProductTracker.Api.Applications.WareHouses.List;

public sealed class ListWareHousesQuery
{
    public string? Q { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
