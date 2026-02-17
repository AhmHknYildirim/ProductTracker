using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixPurchaseRequestDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "RequestDate",
                table: "purchase_requests",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "RequiredDate",
                table: "purchase_request_lines",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 35, 15, 306, DateTimeKind.Utc).AddTicks(8473));

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 35, 15, 306, DateTimeKind.Utc).AddTicks(8482));

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 35, 15, 306, DateTimeKind.Utc).AddTicks(8484));

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 35, 15, 306, DateTimeKind.Utc).AddTicks(8491));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "RequestDate",
                table: "purchase_requests",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AlterColumn<DateTime>(
                name: "RequiredDate",
                table: "purchase_request_lines",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7130));

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7139));

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7141));

            migrationBuilder.UpdateData(
                table: "units",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAtUtc",
                value: new DateTime(2026, 2, 17, 12, 28, 5, 10, DateTimeKind.Utc).AddTicks(7143));
        }
    }
}
