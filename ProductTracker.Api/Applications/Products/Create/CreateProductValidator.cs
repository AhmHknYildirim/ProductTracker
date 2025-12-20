using FluentValidation;

namespace ProductTracker.Api.Application.Products.Create;

public sealed class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
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