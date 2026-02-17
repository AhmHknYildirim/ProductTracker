using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductTracker.Api.Applications.Metrics;
using ProductTracker.Api.Applications.Products.Create;
using ProductTracker.Api.Applications.Products.Delete;
using ProductTracker.Api.Applications.Products.GetById;
using ProductTracker.Api.Applications.Products.List;
using ProductTracker.Api.Applications.Products.Update;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.Create;
using ProductTracker.Api.Applications.Procurements.PurchaseRequests.List;
using ProductTracker.Api.Applications.Procurements.Units.List;
using ProductTracker.Api.Applications.Stocks.Create;
using ProductTracker.Api.Applications.Stocks.Delete;
using ProductTracker.Api.Applications.Stocks.List;
using ProductTracker.Api.Applications.Stocks.Update;
using ProductTracker.Api.Applications.Users.Common;
using ProductTracker.Api.Applications.Users.Login;
using ProductTracker.Api.Applications.Users.Register;
using ProductTracker.Api.Applications.WareHouses.Create;
using ProductTracker.Api.Applications.WareHouses.Delete;
using ProductTracker.Api.Applications.WareHouses.List;
using ProductTracker.Api.Applications.WareHouses.Update;
using ProductTracker.Api.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "frontend",
        p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()
    );
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Postgres");
    options.UseNpgsql(cs);
});

// ---- Current user (ICurrentUser) ----
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpContextCurrentUser>();

// ---- JWT token service ----
builder.Services.AddScoped<JwtTokenService>();

// ---- Auth: JwtBearer ----
var jwt = builder.Configuration.GetSection("Jwt");
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],

            ValidateAudience = true,
            ValidAudience = jwt["Audience"],

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
        };
    });

builder.Services.AddAuthorization();

// ---- Users ----
builder.Services.AddScoped<RegisterHandler>();
builder.Services.AddScoped<RegisterRules>();
builder.Services.AddScoped<IValidator<RegisterRequest>, RegisterValidator>();

builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<LoginRules>();
builder.Services.AddScoped<IValidator<LoginRequest>, LoginValidator>();

// ---- Products ----
builder.Services.AddScoped<CreateProductRules>();
builder.Services.AddScoped<CreateProductHandler>();

builder.Services.AddScoped<UpdateProductRules>();
builder.Services.AddScoped<UpdateProductHandler>();

builder.Services.AddScoped<ListProductsHandler>();
builder.Services.AddScoped<GetProductByIdHandler>();

builder.Services.AddScoped<DeleteProductRules>();
builder.Services.AddScoped<DeleteProductHandler>();

builder.Services.AddScoped<MetricProductsQuantityHandler>();
builder.Services.AddScoped<MetricWareHouseStockHandler>();

// ---- Stocks ----
builder.Services.AddScoped<CreateStockRules>();
builder.Services.AddScoped<CreateStockHandler>();

builder.Services.AddScoped<UpdateStockRules>();
builder.Services.AddScoped<UpdateStockHandler>();

builder.Services.AddScoped<ListStocksHandler>();

builder.Services.AddScoped<DeleteStockRules>();
builder.Services.AddScoped<DeleteStockHandler>();

// ---- WareHouses ----
builder.Services.AddScoped<CreateWareHouseRules>();
builder.Services.AddScoped<CreateWareHouseHandler>();

builder.Services.AddScoped<UpdateWareHouseRules>();
builder.Services.AddScoped<UpdateWareHouseHandler>();

builder.Services.AddScoped<ListWareHousesHandler>();

builder.Services.AddScoped<DeleteWareHouseRules>();
builder.Services.AddScoped<DeleteWareHouseHandler>();

// ---- Procurements: Purchase Requests ----
builder.Services.AddScoped<CreatePurchaseRequestRules>();
builder.Services.AddScoped<CreatePurchaseRequestHandler>();
builder.Services.AddScoped<ListPurchaseRequestsHandler>();
builder.Services.AddScoped<ListUnitsHandler>();

var app = builder.Build();

// Swagger middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("frontend");

// ✅ Global exception handler (Validation + business)
app.Use(
    async (context, next) =>
    {
        try
        {
            await next();
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";

            var errors = ex
                .Errors.GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());

            await context.Response.WriteAsJsonAsync(new { message = "Validation failed", errors });
        }
        catch (InvalidOperationException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { message = ex.Message });
        }
    }
);

// ✅ Auth middlewares (order matters!)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
