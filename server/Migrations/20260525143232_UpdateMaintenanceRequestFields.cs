using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMaintenanceRequestFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HandledById",
                table: "MaintenanceRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsReadByManager",
                table: "MaintenanceRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsReadByResident",
                table: "MaintenanceRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ManagerAnswer",
                table: "MaintenanceRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "MaintenanceRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UnitOrAddress",
                table: "MaintenanceRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MaintenanceRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Village",
                table: "MaintenanceRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRequests_HandledById",
                table: "MaintenanceRequests",
                column: "HandledById");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_HandledById",
                table: "MaintenanceRequests",
                column: "HandledById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_HandledById",
                table: "MaintenanceRequests");

            migrationBuilder.DropIndex(
                name: "IX_MaintenanceRequests_HandledById",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "HandledById",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "IsReadByManager",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "IsReadByResident",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "ManagerAnswer",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "UnitOrAddress",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "Village",
                table: "MaintenanceRequests");
        }
    }
}
