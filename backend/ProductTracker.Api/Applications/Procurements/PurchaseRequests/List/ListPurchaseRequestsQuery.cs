using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.List;

public sealed class ListPurchaseRequestsQuery
{
    public string? Q { get; set; }
    public PurchaseRequestStatus? Status { get; set; }
    public Guid? RequestedByUserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }

    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
