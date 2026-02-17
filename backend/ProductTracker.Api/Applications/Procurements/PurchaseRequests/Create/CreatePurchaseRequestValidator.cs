using FluentValidation;

namespace ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;

public sealed class CreatePurchaseRequestValidator : AbstractValidator<CreatePurchaseRequestRequest>
{
    public CreatePurchaseRequestValidator()
    {
        RuleFor(x => x.RequestDate).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(500);

        RuleFor(x => x.Lines)
            .NotEmpty();

        RuleForEach(x => x.Lines).ChildRules(lines =>
        {
            lines.RuleFor(x => x.ProductId).NotEmpty();
            lines.RuleFor(x => x.Quantity).GreaterThan(0m);
            lines.RuleFor(x => x.UnitId).NotEmpty();
            lines.RuleFor(x => x.Notes).MaximumLength(200);
        });
    }
}
