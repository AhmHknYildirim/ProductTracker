using FluentValidation;

namespace ProductTracker.Api.Applications.WareHouses.Update;

public sealed class UpdateWareHouseValidator : AbstractValidator<UpdateWareHouseRequest>
{
    public UpdateWareHouseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
