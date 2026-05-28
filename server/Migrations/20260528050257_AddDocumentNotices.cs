using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentNotices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_HandledById",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_UserId",
                table: "MaintenanceRequests");

            migrationBuilder.DropIndex(
                name: "IX_Users_UserName",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "DocumentNotices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Village = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    IsVisibleToResidents = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentNotices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentNotices_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentNotices_CreatedByUserId",
                table: "DocumentNotices",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_HandledById",
                table: "MaintenanceRequests",
                column: "HandledById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_UserId",
                table: "MaintenanceRequests",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_HandledById",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_UserId",
                table: "MaintenanceRequests");

            migrationBuilder.DropTable(
                name: "DocumentNotices");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_HandledById",
                table: "MaintenanceRequests",
                column: "HandledById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_UserId",
                table: "MaintenanceRequests",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
