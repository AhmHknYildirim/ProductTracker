namespace ProductTracker.Api.Domain.Entities;

public sealed class CurrencyRate
{
    public Guid Id { get; set; }
    public Guid CurrencyId { get; set; }
    public Currency Currency { get; set; } = null!;
    public DateOnly RateDate { get; set; }
    public decimal RateToTry { get; set; }
    public DateTime FetchedAtUtc { get; set; } = DateTime.UtcNow;
}
