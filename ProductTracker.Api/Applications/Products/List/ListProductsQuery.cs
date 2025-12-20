namespace ProductTracker.Api.Application.Products.List;

public sealed class ListProductsQuery
{
    public string? Q { get; set; }
    public string? Sku { get; set; }
    public int? MinQty { get; set; }
    public int? MaxQty { get; set; }

    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}