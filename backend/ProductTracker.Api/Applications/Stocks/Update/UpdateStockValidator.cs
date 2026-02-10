using FluentValidation;

namespace ProductTracker.Api.Applications.Stocks.Update;

public sealed class UpdateStockValidator : AbstractValidator<UpdateStockRequest>
{
    public UpdateStockValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.WareHouseId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
    }
}
