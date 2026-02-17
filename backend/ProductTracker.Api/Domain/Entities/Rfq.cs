namespace ProductTracker.Api.Domain.Entities;

public sealed class Rfq
{
    public Guid Id { get; set; }

    public string RfqNumber { get; set; } = null!;

    public Guid PurchaseRequestId { get; set; }
    public PurchaseRequest PurchaseRequest { get; set; } = null!;

    public RfqStatus Status { get; set; } = RfqStatus.Draft;

    public DateTime IssueDate { get; set; }
    public DateTime? DueDate { get; set; }

    public ICollection<RfqSupplier> Suppliers { get; set; } = new List<RfqSupplier>();
}
