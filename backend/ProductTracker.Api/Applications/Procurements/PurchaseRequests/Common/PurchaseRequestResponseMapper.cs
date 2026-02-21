using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Common;

public static class PurchaseRequestResponseMapper
{
    public static PurchaseRequestResponse ToResponse(PurchaseRequest entity) =>
        new()
        {
            Id = entity.Id,
            RequestNumber = entity.RequestNumber,
            RequestedByUserId = entity.RequestedByUserId,
            RequestedByUserName = entity.RequestedByUser?.UserName,
            RequestDate = entity.RequestDate,
            Status = entity.Status,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt,
            SubmittedAt = entity.SubmittedAt,
            ApprovedByUserId = entity.ApprovedByUserId,
            ApprovedAt = entity.ApprovedAt,
            RejectionReason = entity.RejectionReason,
            Lines = entity.Lines.Select(ToLineResponse).ToList(),
        };

    private static PurchaseRequestLineResponse ToLineResponse(PurchaseRequestLine line) =>
        new()
        {
            Id = line.Id,
            ProductId = line.ProductId,
            ProductName = line.Product?.Name,
            Quantity = line.Quantity,
            UnitId = line.UnitId,
            UnitCode = line.Unit?.Code,
            UnitName = line.Unit?.Name,
            RequiredDate = line.RequiredDate,
            Notes = line.Notes,
        };
}
