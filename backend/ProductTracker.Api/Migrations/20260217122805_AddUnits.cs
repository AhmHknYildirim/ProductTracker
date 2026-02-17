using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ProductTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUnits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Unit",
                table: "purchase_request_lines");

            migrationBuilder.AddColumn<Guid>(
                name: "UnitId",
                table: "purchase_request_lines",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_units", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "units",
                columns: new[] { "Id", "Code", "CreatedAtUtc", "IsActive", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "PCS", new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7130), true, "Pieces" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "KG", new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7139), true, "Kilogram" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "M", new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7141), true, "Meter" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "L", new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7143), true, "Liter" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_purchase_request_lines_UnitId",
                table: "purchase_request_lines",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_units_Code",
                table: "units",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_request_lines_units_UnitId",
                table: "purchase_request_lines",
                column: "UnitId",
                principalTable: "units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_purchase_request_lines_units_UnitId",
                table: "purchase_request_lines");

            migrationBuilder.DropTable(
                name: "units");

            migrationBuilder.DropIndex(
                name: "IX_purchase_request_lines_UnitId",
                table: "purchase_request_lines");

            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "purchase_request_lines");

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "purchase_request_lines",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");
        }
    }
}
