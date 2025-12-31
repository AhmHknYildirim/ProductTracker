using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Domain.Entities;

namespace ProductTracker.Api.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();

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
        });
        
        modelBuilder.Entity<Product>()
            .HasOne(p => p.User)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}