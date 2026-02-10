using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductTracker.Api.Migrations
{
    /// <inheritdoc />
    [Migration("20260210152000_AddProductRevisionAndWarehouse")]
    public partial class AddProductRevisionAndWarehouse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Revision",
                table: "products",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "v1");

            migrationBuilder.AddColumn<Guid>(
                name: "WareHouseId",
                table: "products",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_WareHouseId",
                table: "products",
                column: "WareHouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_products_warehouses_WareHouseId",
                table: "products",
                column: "WareHouseId",
                principalTable: "warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_warehouses_WareHouseId",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_products_WareHouseId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "products");

            migrationBuilder.DropColumn(
                name: "WareHouseId",
                table: "products");
        }
    }
}
