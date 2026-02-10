using Microsoft.EntityFrameworkCore;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Status)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Product>()
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

        modelBuilder.Entity<ProductStatus>()
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

        modelBuilder.Entity<Stock>()
            .HasOne(s => s.Product)
            .WithMany(p => p.Stocks)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Stock>()
            .HasOne(s => s.WareHouse)
            .WithMany(w => w.Stocks)
            .HasForeignKey(s => s.WareHouseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Stock>()
            .HasQueryFilter(s => s.Product.IsActive);


        modelBuilder.Entity<User>().HasIndex(u => u.UserName).IsUnique();

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        base.OnModelCreating(modelBuilder);
        // .IgnoreQueryFilters() can use if do not want to use IsActive filter globally
        modelBuilder.Entity<Product>().HasQueryFilter(x => x.IsActive);
    }
}
