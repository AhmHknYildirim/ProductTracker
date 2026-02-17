namespace ProductTracker.Api.Domain.Entities;

public sealed class RfqSupplier
{
    public Guid Id { get; set; }

    public Guid RfqId { get; set; }
    public Rfq Rfq { get; set; } = null!;

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public decimal? TotalPrice { get; set; }
    public string Currency { get; set; } = "TRY";

    public bool IsSelected { get; set; }
}
