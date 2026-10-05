using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations;

public partial class AddTwoFactorAuthentication : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>("MfaVerified", "AuthSessions", type: "boolean", nullable: false, defaultValue: false);
        migrationBuilder.AddColumn<string>("MfaSecret", "Users", type: "text", nullable: true);
        migrationBuilder.AddColumn<string>("MfaPendingSecret", "Users", type: "text", nullable: true);
        migrationBuilder.AddColumn<DateTime>("MfaPendingExpiresAt", "Users", type: "timestamp with time zone", nullable: true);
        migrationBuilder.AddColumn<long>("MfaLastTimeStep", "Users", type: "bigint", nullable: true);
        migrationBuilder.AddColumn<string>("MfaRecoveryCodeHashes", "Users", type: "text", nullable: true);
        migrationBuilder.CreateTable("MfaChallenges", columns: table => new {
            Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
            UserId = table.Column<int>(type: "integer", nullable: false),
            PasswordStamp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
            ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
        }, constraints: table => {
            table.PrimaryKey("PK_MfaChallenges", item => item.Id);
            table.ForeignKey("FK_MfaChallenges_Users_UserId", item => item.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
        });
        migrationBuilder.CreateIndex("IX_MfaChallenges_UserId", "MfaChallenges", "UserId");
        migrationBuilder.CreateIndex("IX_MfaChallenges_ExpiresAt", "MfaChallenges", "ExpiresAt");
        // Existing staff sessions predate mandatory MFA and must not remain authenticated.
        migrationBuilder.Sql("DELETE FROM \"AuthSessions\" WHERE \"UserId\" IN (SELECT \"Id\" FROM \"Users\" WHERE \"Role\" <> 'Resident')");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("MfaChallenges");
        migrationBuilder.DropColumn("MfaVerified", "AuthSessions");
        foreach (var name in new[] { "MfaSecret", "MfaPendingSecret", "MfaPendingExpiresAt", "MfaLastTimeStep", "MfaRecoveryCodeHashes" })
            migrationBuilder.DropColumn(name, "Users");
    }
}
