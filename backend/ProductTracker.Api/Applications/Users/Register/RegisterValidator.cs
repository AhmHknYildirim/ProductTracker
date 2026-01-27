using FluentValidation;

namespace ProductTracker.Api.Applications.Users.Register;

public sealed class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);

        RuleFor(x => x.UserName).NotEmpty().MaximumLength(50);

        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);

        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}
