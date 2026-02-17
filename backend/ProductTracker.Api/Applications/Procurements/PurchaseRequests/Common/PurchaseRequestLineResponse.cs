namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;

public sealed class PurchaseRequestLineResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal Quantity { get; set; }
    public Guid UnitId { get; set; }
    public string UnitCode { get; set; } = default!;
    public string UnitName { get; set; } = default!;
    public DateTime? RequiredDate { get; set; }
    public string? Notes { get; set; }
}
