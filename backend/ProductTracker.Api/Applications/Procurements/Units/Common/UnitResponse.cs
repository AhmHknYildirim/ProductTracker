namespace ProductTracker.Api.Applications.Procurements.Units.Common;

public sealed class UnitResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
}
