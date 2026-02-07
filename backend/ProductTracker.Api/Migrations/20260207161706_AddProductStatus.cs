using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ProductTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "products_status",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products_status", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "products_status",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 0, "Active" },
                    { 1, "Inactive" },
                    { 2, "Archived" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_StatusId",
                table: "products",
                column: "StatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_products_products_status_StatusId",
                table: "products",
                column: "StatusId",
                principalTable: "products_status",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_products_status_StatusId",
                table: "products");

            migrationBuilder.DropTable(
                name: "products_status");

            migrationBuilder.DropIndex(
                name: "IX_products_StatusId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "products");
        }
    }
}
