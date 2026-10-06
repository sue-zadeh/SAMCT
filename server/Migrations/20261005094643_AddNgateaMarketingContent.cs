using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddNgateaMarketingContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MarketingImageUrl10",
                table: "VillageProperties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MarketingImageUrl6",
                table: "VillageProperties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MarketingImageUrl7",
                table: "VillageProperties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MarketingImageUrl8",
                table: "VillageProperties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MarketingImageUrl9",
                table: "VillageProperties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "MarketingContents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Slug = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Village = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    Address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Images = table.Column<string[]>(type: "text[]", nullable: false),
                    PriceNzd = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    Availability = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    SourceLabel = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketingContents", x => x.Id);
                    table.CheckConstraint("CK_MarketingContents_Images", "cardinality(\"Images\") <= 10");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketingContents_Slug",
                table: "MarketingContents",
                column: "Slug",
                unique: true);

            // Client-supplied September 2026 brochure; separate from resident/occupancy records.
            // This immutable migration snapshot runs once and does not overwrite later staff edits.
            migrationBuilder.Sql("""
                INSERT INTO "MarketingContents" ("Id", "Slug", "Village", "Kind", "Title", "Description", "Address", "Images", "PriceNzd", "Availability", "SourceLabel", "IsPublished", "DisplayOrder") VALUES
                (1, 'ngatea-overview', 'Ngatea', 'overview', 'Ngatea Independent Lifestyle Village', 'Independent living for seniors in the Hauraki Plains, with a choice of established homes in the Northern Village and modern villas in the Southern Village. The supplied brochure identifies South Auckland Masonic Properties Limited (SAMPL) as the operator.
                
                A monthly service fee covers rates, water usage, building insurance, lawn mowing and general maintenance. Ask the village team for the current fee, availability and Occupation Right Agreement (ORA) before applying.', '', ARRAY['/uploads/ngatea-sep-2026/village-aerial.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 1),
                (10, 'ngatea-hale-place', 'Ngatea', 'area', 'Hale Place', 'A quiet cul-de-sac approximately 140 metres from Ngatea’s main street, with the Health Centre at the end of the street. Ten two-bedroom homes offer open-plan living, accessible features, internal-access garaging and light-filled layouts that balance privacy with a welcoming community.
                
                Photos show representative homes and the area described in the brochure; they are not a promise that a particular unit is available.', 'Hale Place, Ngatea', ARRAY['/uploads/ngatea-sep-2026/hale1.jpg', '/uploads/ngatea-sep-2026/hale2.jpg', '/uploads/ngatea-sep-2026/hale3.jpg', '/uploads/ngatea-sep-2026/hale4.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 10),
                (11, 'ngatea-weddell-place', 'Ngatea', 'area', 'Weddell Place', 'Eight two-bedroom brick-and-tile homes in a quiet cul-de-sac, approximately 90 metres from the main street and across the road from the Health Centre. Open-plan living, wet-floor bathrooms and internal-access garages support easy living close to shops, cafés and community facilities.
                
                Photos show representative homes and the area described in the brochure; they are not a promise that a particular unit is available.', 'Weddell Place, Ngatea', ARRAY['/uploads/ngatea-sep-2026/weddell1.jpg', '/uploads/ngatea-sep-2026/weddell2.jpg', '/uploads/ngatea-sep-2026/weddell3.jpg', '/uploads/ngatea-sep-2026/weddell4.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 11),
                (12, 'ngatea-masonic-place', 'Ngatea', 'area', 'Masonic Place', 'Thirteen two-bedroom brick-and-tile homes arranged around a private loop street and central garden. Nine homes have single garages; four larger homes have two bathrooms and double garages. The brochure describes modern kitchens, insulation, double glazing, heat pumps and storage, within walking distance of the Health Centre and main street.
                
                Photos show representative homes and the area described in the brochure; they are not a promise that a particular unit is available.', 'Masonic Place, Ngatea', ARRAY['/uploads/ngatea-sep-2026/masonic1.jpg', '/uploads/ngatea-sep-2026/masonic2.jpg', '/uploads/ngatea-sep-2026/masonic3.jpg', '/uploads/ngatea-sep-2026/masonic4.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 12),
                (13, 'ngatea-lodge-drive', 'Ngatea', 'area', 'Lodge Drive', 'Nine two-bedroom brick-and-tile homes beside Masonic Place, arranged around a peaceful loop street off Factory Lane. Homes offer open-plan kitchen, dining and living areas, single internal-access garages and private outdoor spaces. A pathway connects to Masonic Place and the nearby Health Centre.
                
                Photos show representative homes and the area described in the brochure; they are not a promise that a particular unit is available.', 'Lodge Drive, Ngatea', ARRAY['/uploads/ngatea-sep-2026/lodge1.jpg', '/uploads/ngatea-sep-2026/lodge2.jpg', '/uploads/ngatea-sep-2026/lodge3.jpg', '/uploads/ngatea-sep-2026/lodge4.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 13),
                (14, 'ngatea-masons-way', 'Ngatea', 'area', 'Masons Way', 'Modern Southern Village homes in a peaceful, semi-rural setting. Features described in the brochure include open-plan living, double glazing, a private patio, central heating and cooling, a master bedroom with walk-in wardrobe and ensuite, and a carpeted, insulated double garage. Residents can personalise garden spaces, with lawn care included.
                
                Photos show representative homes and the area described in the brochure; they are not a promise that a particular unit is available.', 'Masons Way, Ngatea', ARRAY['/uploads/ngatea-sep-2026/masons1.jpg', '/uploads/ngatea-sep-2026/masons2.jpg', '/uploads/ngatea-sep-2026/masons3.jpg', '/uploads/ngatea-sep-2026/masons4.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 14),
                (20, 'ngatea-11-masons-way', 'Ngatea', 'unit', '11 Masons Way, Ngatea', 'A near-new 156 m² villa on approximately 500 m², offered through an Occupation Right Agreement (ORA). Open-plan living, two double bedrooms, a master ensuite and a double internal-access garage.', '11 Masons Way, Ngatea', ARRAY['/uploads/ngatea-sep-2026/11-masons-way.jpg']::text[], 690000, 'Under offer', 'September 2026 brochure', TRUE, 20),
                (21, 'ngatea-1a-masons-way', 'Ngatea', 'unit', '1A Masons Way, Ngatea', 'A new 141 m² villa on approximately 500 m², with open-plan kitchen, dining and living, two generous double bedrooms, a master ensuite and a double internal-access garage. A monthly service fee applies. The brochure photograph shows a staged unit.', '1A Masons Way, Ngatea', ARRAY['/uploads/ngatea-sep-2026/1a-masons-way.jpg']::text[], 620000, 'Applications invited', 'September 2026 brochure', TRUE, 21),
                (22, 'ngatea-4-masonic-place', 'Ngatea', 'unit', '4 Masonic Place, Ngatea', 'An ORA home described as freshly updated with a new kitchen, bathroom, paint and carpet. Includes open-plan living, double glazing, a heat pump, two double bedrooms, a spacious bathroom and a single garage. A monthly service fee applies.', '4 Masonic Place, Ngatea', ARRAY['/uploads/ngatea-sep-2026/4-masonic-place.jpg']::text[], 595000, 'Under offer', 'September 2026 brochure', TRUE, 22),
                (23, 'ngatea-14-masonic-place', 'Ngatea', 'unit', '14 Masonic Place, Ngatea', 'An ORA home described as freshly updated with a new kitchen, bathroom, paint and carpet. Includes open-plan living, double glazing, a heat pump, two double bedrooms, a spacious bathroom and a single garage. A monthly service fee applies.', '14 Masonic Place, Ngatea', ARRAY['/uploads/ngatea-sep-2026/14-masonic-place.jpg']::text[], 595000, 'Under offer', 'September 2026 brochure', TRUE, 23),
                (30, 'ngatea-faq-1', 'Ngatea', 'faq', 'What is an Occupation Right Agreement?', 'An ORA sets out the terms of living in the village and gives the right to occupy a home. The September 2026 brochure describes an upfront payment and a facility fee of 4% per year for up to six years, capped at 24% of the original price, with no capital gain. Ask the village team for the current agreement and review it with your solicitor.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 30),
                (31, 'ngatea-faq-2', 'Ngatea', 'faq', 'Can an application depend on selling my home?', 'The brochure says this can form part of an application, with up to three months to sell an existing home. Confirm the conditions and dates with the village team.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 31),
                (32, 'ngatea-faq-3', 'Ngatea', 'faq', 'Can I change my home or add a garden shed?', 'Structural changes, additions and garden sheds need the Village Manager’s written approval before installation. The brochure says approved additions are normally left in place when you leave, without reimbursement. Ask about the permitted design and current terms.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 32),
                (33, 'ngatea-faq-4', 'Ngatea', 'faq', 'What about rubbish and recycling?', 'The brochure lists weekly general waste and fortnightly recycling collections on Wednesdays. Confirm the current collection schedule with the Village Manager.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 33),
                (34, 'ngatea-faq-5', 'Ngatea', 'faq', 'Can I plant a garden?', 'Gardens and small, shallow-rooted trees are described as welcome where they do not obstruct neighbours’ views or sunlight, mowing access, concrete or septic systems. Discuss planting plans with the Village Manager.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 34),
                (35, 'ngatea-faq-6', 'Ngatea', 'faq', 'Can I park a campervan or boat?', 'Most units do not have space for a campervan or boat. Space depends on the particular home, and the brochure suggests local storage facilities as another option.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 35),
                (36, 'ngatea-faq-7', 'Ngatea', 'faq', 'Can I hang pictures or secure bookshelves?', 'The brochure permits pictures and securing bookshelves to walls. Check the installation details with the Village Manager if you are unsure.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 36),
                (37, 'ngatea-faq-8', 'Ngatea', 'faq', 'Are pets allowed?', 'Pets are considered as part of the application. Most units do not have individual fencing, and dogs cannot roam off lead. Approval takes other residents’ enjoyment into account.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 37),
                (38, 'ngatea-faq-9', 'Ngatea', 'faq', 'Who supplies curtains and blinds?', 'The brochure says incoming residents choose and pay for their own curtains or blinds.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 38),
                (40, 'ngatea-next-steps', 'Ngatea', 'steps', 'Arrange a visit and take the next step', '1. Contact Richardsons Real Estate Hauraki to arrange a viewing and discuss your needs.
                2. Request an information pack, the current ORA and an application form.
                3. The completed application and any conditions are submitted for village approval.
                4. Once the application is approved and a home is available, the team confirms the next steps and moving dates.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 40),
                (41, 'ngatea-contact', 'Ngatea', 'contact', 'Speak with the Ngatea team', 'Richardsons Real Estate Hauraki
                Avalon Pascoe or Hayley MacKay
                Office: 07 867 7800
                Email: ngatea@richardsons.co.nz
                
                Contact the team to confirm current prices, availability, monthly fees and ORA terms, or use the SAMCT contact page.', '', ARRAY[]::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 41),
                (42, 'ngatea-town', 'Ngatea', 'town', 'Life in Ngatea', 'Ngatea is a rural town in the Hauraki Plains with shops, cafés, healthcare services, a pharmacy, library, parks and community facilities. The brochure highlights local clubs, sports and social groups, with opportunities to enjoy nearby cycle trails, beaches and reserves.', '', ARRAY['/uploads/ngatea-sep-2026/ngatea-town.jpg']::text[], NULL, 'Enquire', 'September 2026 brochure', TRUE, 42);
                SELECT setval(pg_get_serial_sequence('"MarketingContents"', 'Id'), (SELECT MAX("Id") FROM "MarketingContents"));
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketingContents");

            migrationBuilder.DropColumn(
                name: "MarketingImageUrl10",
                table: "VillageProperties");

            migrationBuilder.DropColumn(
                name: "MarketingImageUrl6",
                table: "VillageProperties");

            migrationBuilder.DropColumn(
                name: "MarketingImageUrl7",
                table: "VillageProperties");

            migrationBuilder.DropColumn(
                name: "MarketingImageUrl8",
                table: "VillageProperties");

            migrationBuilder.DropColumn(
                name: "MarketingImageUrl9",
                table: "VillageProperties");
        }
    }
}
