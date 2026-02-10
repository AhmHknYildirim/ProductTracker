using FluentValidation;

namespace ProductTracker.Api.Applications.WareHouses.Create;

public sealed class CreateWareHouseValidator : AbstractValidator<CreateWareHouseRequest>
{
    public CreateWareHouseValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
