using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class ExpandMarketingGalleriesAndContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_MarketingContents_Images",
                table: "MarketingContents");

            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "MarketingContents",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "MarketingContents",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "CK_MarketingContents_Images",
                table: "MarketingContents",
                sql: "cardinality(\"Images\") <= 30");

            // Contact printed on page 5 of the supplied September 2026 booklet.
            // Populate new fields only; preserve existing copy, photos and publication choices.
            migrationBuilder.Sql("""
                UPDATE "MarketingContents"
                SET "ContactName" = 'Avalon or Hayley', "ContactPhone" = '07 867 7800'
                WHERE "Village" = 'Ngatea'
                  AND "Slug" IN (
                    'ngatea-hale-place', 'ngatea-weddell-place', 'ngatea-masonic-place',
                    'ngatea-lodge-drive', 'ngatea-masons-way', 'ngatea-11-masons-way',
                    'ngatea-1a-masons-way', 'ngatea-4-masonic-place', 'ngatea-14-masonic-place',
                    'ngatea-contact'
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_MarketingContents_Images",
                table: "MarketingContents");

            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "MarketingContents");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "MarketingContents");

            migrationBuilder.AddCheckConstraint(
                name: "CK_MarketingContents_Images",
                table: "MarketingContents",
                sql: "cardinality(\"Images\") <= 10");
        }
    }
}
