using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;

public sealed class PurchaseRequestResponse
{
    public Guid Id { get; set; }
    public string RequestNumber { get; set; } = default!;
    public Guid RequestedByUserId { get; set; }
    public string? RequestedByUserName { get; set; }
    public DateTime RequestDate { get; set; }
    public PurchaseRequestStatus Status { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public List<PurchaseRequestLineResponse> Lines { get; set; } = new();
}
