namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;

public sealed class CreatePurchaseRequestRequest
{
    public DateTime RequestDate { get; set; }
    public string? Description { get; set; }
    public List<CreatePurchaseRequestLineRequest> Lines { get; set; } = new();
}
