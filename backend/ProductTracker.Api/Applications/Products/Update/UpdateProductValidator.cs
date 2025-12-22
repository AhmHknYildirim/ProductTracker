using FluentValidation;

namespace ProductTracker.Api.Application.Products.Update;

public sealed class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Sku)
            .MaximumLength(64);

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0);
    }
}
