using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ProductStatus> ProductStatuses => Set<ProductStatus>();
    public DbSet<WareHouse> WareHouses => Set<WareHouse>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<CurrencyRate> CurrencyRates => Set<CurrencyRate>();
    public DbSet<PurchaseRequest> PurchaseRequests => Set<PurchaseRequest>();
    public DbSet<PurchaseRequestLine> PurchaseRequestLines => Set<PurchaseRequestLine>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Rfq> Rfqs => Set<Rfq>();
    public DbSet<RfqSupplier> RfqSuppliers => Set<RfqSupplier>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<GoodsReceipt> GoodsReceipts => Set<GoodsReceipt>();
    public DbSet<GoodsReceiptLine> GoodsReceiptLines => Set<GoodsReceiptLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var utcConverter = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableUtcConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue
                ? (v.Value.Kind == DateTimeKind.Utc
                    ? v.Value
                    : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc))
                : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        modelBuilder.Entity<Product>(b =>
        {
            b.ToTable("products");
            b.HasKey(x => x.Id);

            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Sku).HasMaxLength(64);
            b.Property(x => x.Revision).HasMaxLength(64).IsRequired();
            b.Property(x => x.Quantity).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.WareHouseId).IsRequired(false);
            b.Property(x => x.StatusId).IsRequired().HasDefaultValue(0);
            b.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
        });

        modelBuilder
            .Entity<Product>()
            .HasOne(p => p.User)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<Product>()
            .HasOne(p => p.Status)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<Product>()
            .HasOne(p => p.WareHouse)
            .WithMany(w => w.Products)
            .HasForeignKey(p => p.WareHouseId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ProductStatus>(b =>
        {
            b.ToTable("products_status");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.Property(x => x.Name).HasMaxLength(32).IsRequired();
        });

        modelBuilder
            .Entity<ProductStatus>()
            .HasData(
                new ProductStatus { Id = 0, Name = "Active" },
                new ProductStatus { Id = 1, Name = "Inactive" },
                new ProductStatus { Id = 2, Name = "Archived" }
            );

        modelBuilder.Entity<WareHouse>(b =>
        {
            b.ToTable("warehouses");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Stock>(b =>
        {
            b.ToTable("stocks");
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).IsRequired();
            b.HasIndex(x => new { x.ProductId, x.WareHouseId }).IsUnique();
        });

        modelBuilder
            .Entity<Stock>()
            .HasOne(s => s.Product)
            .WithMany(p => p.Stocks)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<Stock>()
            .HasOne(s => s.WareHouse)
            .WithMany(w => w.Stocks)
            .HasForeignKey(s => s.WareHouseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Stock>().HasQueryFilter(s => s.Product.IsActive);

        modelBuilder.Entity<User>().HasIndex(u => u.UserName).IsUnique();

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Supplier>(b =>
        {
            b.ToTable("suppliers");
            b.HasKey(x => x.Id);
            b.Property(x => x.Code).HasMaxLength(32).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.TaxNumber).HasMaxLength(32);
            b.Property(x => x.Email).HasMaxLength(200);
            b.Property(x => x.Phone).HasMaxLength(32);
            b.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
        });

        modelBuilder.Entity<Unit>(b =>
        {
            b.ToTable("units");
            b.HasKey(x => x.Id);
            b.Property(x => x.Code).HasMaxLength(16).IsRequired();
            b.Property(x => x.Name).HasMaxLength(64).IsRequired();
            b.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
            b.Property(x => x.CreatedAtUtc).IsRequired();
            b.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder
            .Entity<Unit>()
            .HasData(
                new Unit
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Code = "PCS",
                    Name = "Pieces",
                },
                new Unit
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Code = "KG",
                    Name = "Kilogram",
                },
                new Unit
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Code = "M",
                    Name = "Meter",
                },
                new Unit
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Code = "L",
                    Name = "Liter",
                }
            );

        modelBuilder.Entity<Currency>(b =>
        {
            b.ToTable("currencies");
            b.HasKey(x => x.Id);
            b.Property(x => x.Code).HasMaxLength(3).IsRequired();
            b.Property(x => x.Name).HasMaxLength(100).IsRequired();
            b.Property(x => x.Symbol).HasMaxLength(8).IsRequired();
            b.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
            b.Property(x => x.CreatedAtUtc).IsRequired();
            b.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<CurrencyRate>(b =>
        {
            b.ToTable("currency_rates");
            b.HasKey(x => x.Id);
            b.Property(x => x.RateDate).HasColumnType("date").IsRequired();
            b.Property(x => x.RateToTry).IsRequired();
            b.Property(x => x.FetchedAtUtc).IsRequired();
        });

        modelBuilder
            .Entity<CurrencyRate>()
            .HasOne(r => r.Currency)
            .WithMany()
            .HasForeignKey(r => r.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseRequest>(b =>
        {
            b.ToTable("purchase_requests");
            b.HasKey(x => x.Id);
            b.Property(x => x.RequestNumber).HasMaxLength(32).IsRequired();
            b.Property(x => x.Status).IsRequired();
            b.Property(x => x.RequestDate)
                .HasColumnType("date")
                .HasConversion(utcConverter)
                .IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.RequestedByUserId).IsRequired();
            b.Property(x => x.ApprovedByUserId).IsRequired(false);
            b.HasIndex(x => x.RequestNumber).IsUnique();
        });

        modelBuilder.Entity<PurchaseRequestLine>(b =>
        {
            b.ToTable("purchase_request_lines");
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).IsRequired();
            b.Property(x => x.UnitId).IsRequired();
            b.Property(x => x.RequiredDate)
                .HasColumnType("date")
                .HasConversion(nullableUtcConverter)
                .IsRequired(false);
        });

        modelBuilder
            .Entity<PurchaseRequest>()
            .HasMany(r => r.Lines)
            .WithOne(l => l.PurchaseRequest)
            .HasForeignKey(l => l.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<PurchaseRequestLine>()
            .HasOne(l => l.Product)
            .WithMany()
            .HasForeignKey(l => l.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<PurchaseRequestLine>()
            .HasOne(l => l.Unit)
            .WithMany()
            .HasForeignKey(l => l.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<PurchaseRequest>()
            .HasOne(r => r.RequestedByUser)
            .WithMany()
            .HasForeignKey(r => r.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<PurchaseRequest>()
            .HasOne(r => r.ApprovedByUser)
            .WithMany()
            .HasForeignKey(r => r.ApprovedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Rfq>(b =>
        {
            b.ToTable("rfqs");
            b.HasKey(x => x.Id);
            b.Property(x => x.RfqNumber).HasMaxLength(32).IsRequired();
            b.Property(x => x.Status).IsRequired();
            b.Property(x => x.IssueDate).IsRequired();
            b.Property(x => x.DueDate).IsRequired(false);
        });

        modelBuilder
            .Entity<Rfq>()
            .HasOne(r => r.PurchaseRequest)
            .WithMany()
            .HasForeignKey(r => r.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RfqSupplier>(b =>
        {
            b.ToTable("rfq_suppliers");
            b.HasKey(x => x.Id);
            b.Property(x => x.Currency).HasMaxLength(3).IsRequired();
            b.Property(x => x.TotalPrice).IsRequired(false);
        });

        modelBuilder
            .Entity<Rfq>()
            .HasMany(r => r.Suppliers)
            .WithOne(s => s.Rfq)
            .HasForeignKey(s => s.RfqId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<RfqSupplier>()
            .HasOne(s => s.Supplier)
            .WithMany()
            .HasForeignKey(s => s.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrder>(b =>
        {
            b.ToTable("purchase_orders");
            b.HasKey(x => x.Id);
            b.Property(x => x.OrderNumber).HasMaxLength(32).IsRequired();
            b.Property(x => x.Status).IsRequired();
            b.Property(x => x.OrderDate).IsRequired();
            b.Property(x => x.CurrencyId).IsRequired();
            b.Property(x => x.FxRateToTry).IsRequired(false);
            b.Property(x => x.ApprovedAt).IsRequired(false);
        });

        modelBuilder
            .Entity<PurchaseOrder>()
            .HasOne(p => p.PurchaseRequest)
            .WithMany()
            .HasForeignKey(p => p.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<PurchaseOrder>()
            .HasOne(p => p.Currency)
            .WithMany()
            .HasForeignKey(p => p.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrderLine>(b =>
        {
            b.ToTable("purchase_order_lines");
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).IsRequired();
            b.Property(x => x.UnitPrice).IsRequired();
            b.Property(x => x.Unit).HasMaxLength(32).IsRequired();
            b.Property(x => x.ReceivedQuantity).IsRequired().HasDefaultValue(0m);
        });

        modelBuilder
            .Entity<PurchaseOrder>()
            .HasMany(p => p.Lines)
            .WithOne(l => l.PurchaseOrder)
            .HasForeignKey(l => l.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<PurchaseOrder>()
            .HasOne(p => p.Supplier)
            .WithMany()
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<PurchaseOrder>()
            .HasOne(p => p.Rfq)
            .WithMany()
            .HasForeignKey(p => p.RfqId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder
            .Entity<PurchaseOrderLine>()
            .HasOne(l => l.Product)
            .WithMany()
            .HasForeignKey(l => l.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<PurchaseOrder>()
            .HasOne(p => p.ApprovedByUser)
            .WithMany()
            .HasForeignKey(p => p.ApprovedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<GoodsReceipt>(b =>
        {
            b.ToTable("goods_receipts");
            b.HasKey(x => x.Id);
            b.Property(x => x.ReceiptNumber).HasMaxLength(32).IsRequired();
            b.Property(x => x.Status).IsRequired();
            b.Property(x => x.ReceivedAt).IsRequired();
            b.Property(x => x.Notes).HasMaxLength(500);
        });

        modelBuilder
            .Entity<GoodsReceipt>()
            .HasOne(r => r.PurchaseOrder)
            .WithMany()
            .HasForeignKey(r => r.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<GoodsReceipt>()
            .HasOne(r => r.WareHouse)
            .WithMany()
            .HasForeignKey(r => r.WareHouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<GoodsReceipt>()
            .HasOne(r => r.ReceivedByUser)
            .WithMany()
            .HasForeignKey(r => r.ReceivedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GoodsReceiptLine>(b =>
        {
            b.ToTable("goods_receipt_lines");
            b.HasKey(x => x.Id);
            b.Property(x => x.ReceivedQuantity).IsRequired();
            b.Property(x => x.Unit).HasMaxLength(32).IsRequired();
        });

        modelBuilder
            .Entity<GoodsReceipt>()
            .HasMany(r => r.Lines)
            .WithOne(l => l.GoodsReceipt)
            .HasForeignKey(l => l.GoodsReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<GoodsReceiptLine>()
            .HasOne(l => l.PurchaseOrderLine)
            .WithMany()
            .HasForeignKey(l => l.PurchaseOrderLineId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<GoodsReceiptLine>()
            .HasOne(l => l.Product)
            .WithMany()
            .HasForeignKey(l => l.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
        // .IgnoreQueryFilters() can use if do not want to use IsActive filter globally
        modelBuilder.Entity<Product>().HasQueryFilter(x => x.IsActive);
    }
}
