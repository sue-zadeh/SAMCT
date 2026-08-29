using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using server.Data;

#nullable disable

namespace server.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260829000000_AddRevokedTokens")]
public partial class AddRevokedTokens : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "TokenVersion",
            table: "Users",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.Sql(
            "CREATE UNIQUE INDEX \"IX_Users_Email_Normalized\" ON \"Users\" (LOWER(\"Email\"));");
        migrationBuilder.Sql(
            "CREATE UNIQUE INDEX \"IX_Users_UserName_Normalized\" ON \"Users\" (LOWER(\"UserName\"));");

        migrationBuilder.CreateTable(
            name: "RevokedTokens",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation(
                        "Npgsql:ValueGenerationStrategy",
                        NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                JwtId = table.Column<string>(type: "text", nullable: false),
                UserId = table.Column<int>(type: "integer", nullable: false),
                RevokedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_RevokedTokens", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_RevokedTokens_ExpiresAtUtc",
            table: "RevokedTokens",
            column: "ExpiresAtUtc");

        migrationBuilder.CreateIndex(
            name: "IX_RevokedTokens_JwtId",
            table: "RevokedTokens",
            column: "JwtId",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "RevokedTokens");

        migrationBuilder.DropColumn(
            name: "TokenVersion",
            table: "Users");

        migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_Users_Email_Normalized\";");
        migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_Users_UserName_Normalized\";");
    }
}
