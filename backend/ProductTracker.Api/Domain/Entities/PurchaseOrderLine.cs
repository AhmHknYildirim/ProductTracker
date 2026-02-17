namespace ProductTracker.Api.Domain.Entities;

public sealed class PurchaseOrderLine
{
    public Guid Id { get; set; }
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Guid? SourcePurchaseRequestLineId { get; set; }
    public PurchaseRequestLine? SourcePurchaseRequestLine { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal LineTotal => Quantity * UnitPrice;
}
