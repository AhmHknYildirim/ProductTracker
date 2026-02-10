using FluentValidation;

namespace ProductTracker.Api.Applications.Stocks.Create;

public sealed class CreateStockValidator : AbstractValidator<CreateStockRequest>
{
    public CreateStockValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.WareHouseId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
    }
}
