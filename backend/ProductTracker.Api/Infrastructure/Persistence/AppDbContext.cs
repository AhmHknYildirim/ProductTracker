using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ProductStatus> ProductStatuses => Set<ProductStatus>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(b =>
        {
            b.ToTable("products");
            b.HasKey(x => x.Id);

            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Sku).HasMaxLength(64);
            b.Property(x => x.Quantity).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.StatusId).IsRequired().HasDefaultValue(0);
        });
        
        modelBuilder.Entity<Product>()
            .HasOne(p => p.User)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Status)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

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

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
