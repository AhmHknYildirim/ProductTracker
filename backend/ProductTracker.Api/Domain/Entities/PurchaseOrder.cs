namespace ProductTracker.Api.Domain.Entities;

public sealed class PurchaseOrder
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = null!;
    public Guid PurchaseRequestId { get; set; }
    public PurchaseRequest PurchaseRequest { get; set; } = null!;
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public Guid? RfqId { get; set; }
    public Rfq? Rfq { get; set; }
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public DateTime OrderDate { get; set; }
    public Guid CurrencyId { get; set; }
    public Currency Currency { get; set; } = null!;
    public decimal? FxRateToTry { get; set; }
    public ICollection<PurchaseOrderLine> Lines { get; set; } = new List<PurchaseOrderLine>();
    public Guid? ApprovedByUserId { get; set; }
    public User? ApprovedByUser { get; set; }
    public DateTime? ApprovedAt { get; set; }
}
