namespace ProductTracker.Api.Domain.Entities;

public enum PurchaseOrderStatus
{
    Draft = 0,
    Approved = 1,
    Ordered = 2,
    PartiallyReceived = 3,
    Received = 4,
    Cancelled = 5
}
