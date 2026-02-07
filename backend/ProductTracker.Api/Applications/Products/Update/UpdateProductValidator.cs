using FluentValidation;

namespace ProductTracker.Api.Applications.Products.Update;

public sealed class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);

        RuleFor(x => x.Sku).MaximumLength(64);

        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);

        RuleFor(x => x.Status).IsInEnum();
    }
}
