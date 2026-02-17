namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;

public sealed class CreatePurchaseRequestLineRequest
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public Guid UnitId { get; set; }
    public DateTime? RequiredDate { get; set; }
    public string? Notes { get; set; }
}
