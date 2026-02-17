namespace ProductTracker.Api.Domain.Entities;

public class GoodsReceiptLine
{
    public Guid Id { get; set; }

    public Guid GoodsReceiptId { get; set; }
    public GoodsReceipt GoodsReceipt { get; set; } = null!;

    public Guid PurchaseOrderLineId { get; set; }
    public PurchaseOrderLine PurchaseOrderLine { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal ReceivedQuantity { get; set; }
    public string Unit { get; set; } = null!;
}
