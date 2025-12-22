using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ProductTracker.Api.Application.Products.Create;
using ProductTracker.Api.Application.Products.GetById;
using ProductTracker.Api.Application.Products.List;
using ProductTracker.Api.Application.Products.Update;
using ProductTracker.Api.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Postgres");
    options.UseNpgsql(cs);
});

builder.Services.AddScoped<CreateProductRules>();
builder.Services.AddScoped<CreateProductHandler>();

builder.Services.AddScoped<UpdateProductRules>();
builder.Services.AddScoped<UpdateProductHandler>();

builder.Services.AddScoped<ListProductsHandler>();
builder.Services.AddScoped<GetProductByIdHandler>();

var app = builder.Build();

// Swagger middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("frontend");
app.MapControllers();

app.Run();