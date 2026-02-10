using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductTracker.Api.Migrations
{
    /// <inheritdoc />
    [Migration("20260210140000_AddWarehousesAndStocks")]
    public partial class AddWarehousesAndStocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "warehouses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "stocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    WareHouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stocks_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stocks_warehouses_WareHouseId",
                        column: x => x.WareHouseId,
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_stocks_ProductId_WareHouseId",
                table: "stocks",
                columns: new[] { "ProductId", "WareHouseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stocks_WareHouseId",
                table: "stocks",
                column: "WareHouseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "stocks");

            migrationBuilder.DropTable(
                name: "warehouses");
        }
    }
}
