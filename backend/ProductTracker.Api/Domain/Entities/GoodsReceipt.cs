namespace ProductTracker.Api.Domain.Entities;

public sealed class GoodsReceipt
{
    public Guid Id { get; set; }

    public string ReceiptNumber { get; set; } = null!;

    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public Guid WareHouseId { get; set; }
    public WareHouse WareHouse { get; set; } = null!;

    public GoodsReceiptStatus Status { get; set; } = GoodsReceiptStatus.Draft;

    public Guid ReceivedByUserId { get; set; }
    public User ReceivedByUser { get; set; } = null!;

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }

    public ICollection<GoodsReceiptLine> Lines { get; set; } = new List<GoodsReceiptLine>();
}
