namespace ProductTracker.Api.Domain.Entities;

public sealed class PurchaseRequestLine
{
    public Guid Id { get; set; }
    public Guid PurchaseRequestId { get; set; }
    public PurchaseRequest PurchaseRequest { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal Quantity { get; set; }
    public Guid UnitId { get; set; }
    public Unit Unit { get; set; } = null!;
    public DateTime? RequiredDate { get; set; }
    public string? Notes { get; set; }
}
