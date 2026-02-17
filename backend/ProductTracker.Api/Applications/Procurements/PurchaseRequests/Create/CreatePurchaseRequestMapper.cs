using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;

public static class CreatePurchaseRequestMapper
{
    private static DateTime AsUtc(DateTime value)
        => value.Kind == DateTimeKind.Utc ? value : DateTime.SpecifyKind(value, DateTimeKind.Utc);

    private static DateTime? AsUtc(DateTime? value)
        => value.HasValue ? AsUtc(value.Value) : null;

    public static PurchaseRequest ToEntity(
        CreatePurchaseRequestRequest req,
        Guid requestedByUserId,
        string requestNumber
    ) =>
        new()
        {
            Id = Guid.NewGuid(),
            RequestNumber = requestNumber,
            RequestedByUserId = requestedByUserId,
            RequestDate = AsUtc(req.RequestDate),
            Status = PurchaseRequestStatus.Draft,
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            CreatedAt = DateTime.UtcNow,
            SubmittedAt = null,
            Lines = req.Lines.Select(ToLineEntity).ToList(),
        };

    private static PurchaseRequestLine ToLineEntity(CreatePurchaseRequestLineRequest line) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = line.ProductId,
            Quantity = line.Quantity,
            UnitId = line.UnitId,
            RequiredDate = AsUtc(line.RequiredDate),
            Notes = string.IsNullOrWhiteSpace(line.Notes) ? null : line.Notes.Trim(),
        };
}
