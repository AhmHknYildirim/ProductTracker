namespace ProductTracker.Api.Domain.Entities;

public sealed class PurchaseRequest
{
    public Guid Id { get; set; }

    public string RequestNumber { get; set; } = null!;

    public Guid RequestedByUserId { get; set; }
    public User RequestedByUser { get; set; } = null!;

    public DateTime RequestDate { get; set; }

    public PurchaseRequestStatus Status { get; set; } = PurchaseRequestStatus.Draft;

    public string? Description { get; set; }

    public ICollection<PurchaseRequestLine> Lines { get; set; } = new List<PurchaseRequestLine>();

    public Guid? ApprovedByUserId { get; set; }
    public User? ApprovedByUser { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
}
