using ProductTracker.Api.Applications.Products.Common;

namespace ProductTracker.Api.Applications.Products.List;

public sealed class ListProductsQuery
{
    public string? Q { get; set; }
    public string? Sku { get; set; }
    public int? MinQty { get; set; }
    public int? MaxQty { get; set; }
    public ProductStatusKind? Status { get; set; }
    public int? StatusId { get; set; }

    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

