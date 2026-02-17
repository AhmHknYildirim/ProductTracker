namespace ProductTracker.Api.Applications.Procurements.Common;

public sealed class PagedResult<T>
{
    public long Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public List<T> Items { get; set; } = new();
}
