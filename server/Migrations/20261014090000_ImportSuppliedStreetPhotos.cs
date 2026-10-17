using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using server.Data;

#nullable disable

namespace server.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261014090000_ImportSuppliedStreetPhotos")]
public class ImportSuppliedStreetPhotos : Migration
{
    // Data only: never overwrite staff-edited photo arrays or change publication/contact details.
    // Original PDF photos and maps keep their existing positions (1–4).
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/hale1.jpg', '/uploads/ngatea-sep-2026/hale2.jpg', '/uploads/ngatea-sep-2026/hale3.jpg', '/uploads/ngatea-sep-2026/hale4.jpg', '/uploads/ngatea-sep-2026/hale5.jpg', '/uploads/ngatea-sep-2026/hale6.jpg', '/uploads/ngatea-sep-2026/hale7.jpg', '/uploads/ngatea-sep-2026/hale8.jpg', '/uploads/ngatea-sep-2026/hale9.jpg', '/uploads/ngatea-sep-2026/hale10.jpg']::text[]
            WHERE "Slug" = 'ngatea-hale-place' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/hale1.jpg', '/uploads/ngatea-sep-2026/hale2.jpg', '/uploads/ngatea-sep-2026/hale3.jpg', '/uploads/ngatea-sep-2026/hale4.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/weddell1.jpg', '/uploads/ngatea-sep-2026/weddell2.jpg', '/uploads/ngatea-sep-2026/weddell3.jpg', '/uploads/ngatea-sep-2026/weddell4.jpg', '/uploads/ngatea-sep-2026/weddell5.jpg', '/uploads/ngatea-sep-2026/weddell6.jpg', '/uploads/ngatea-sep-2026/weddell7.jpg', '/uploads/ngatea-sep-2026/weddell8.jpg', '/uploads/ngatea-sep-2026/weddell9.jpg', '/uploads/ngatea-sep-2026/weddell10.jpg']::text[]
            WHERE "Slug" = 'ngatea-weddell-place' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/weddell1.jpg', '/uploads/ngatea-sep-2026/weddell2.jpg', '/uploads/ngatea-sep-2026/weddell3.jpg', '/uploads/ngatea-sep-2026/weddell4.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/masonic1.jpg', '/uploads/ngatea-sep-2026/masonic2.jpg', '/uploads/ngatea-sep-2026/masonic3.jpg', '/uploads/ngatea-sep-2026/masonic4.jpg', '/uploads/ngatea-sep-2026/masonic5.jpg', '/uploads/ngatea-sep-2026/masonic6.jpg', '/uploads/ngatea-sep-2026/masonic7.jpg', '/uploads/ngatea-sep-2026/masonic8.jpg', '/uploads/ngatea-sep-2026/masonic9.jpg', '/uploads/ngatea-sep-2026/masonic10.jpg']::text[]
            WHERE "Slug" = 'ngatea-masonic-place' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/masonic1.jpg', '/uploads/ngatea-sep-2026/masonic2.jpg', '/uploads/ngatea-sep-2026/masonic3.jpg', '/uploads/ngatea-sep-2026/masonic4.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/lodge1.jpg', '/uploads/ngatea-sep-2026/lodge2.jpg', '/uploads/ngatea-sep-2026/lodge3.jpg', '/uploads/ngatea-sep-2026/lodge4.jpg', '/uploads/ngatea-sep-2026/lodge5.jpg', '/uploads/ngatea-sep-2026/lodge6.jpg', '/uploads/ngatea-sep-2026/lodge7.jpg', '/uploads/ngatea-sep-2026/lodge8.jpg', '/uploads/ngatea-sep-2026/lodge9.jpg', '/uploads/ngatea-sep-2026/lodge10.jpg']::text[]
            WHERE "Slug" = 'ngatea-lodge-drive' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/lodge1.jpg', '/uploads/ngatea-sep-2026/lodge2.jpg', '/uploads/ngatea-sep-2026/lodge3.jpg', '/uploads/ngatea-sep-2026/lodge4.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/masons1.jpg', '/uploads/ngatea-sep-2026/masons2.jpg', '/uploads/ngatea-sep-2026/masons3.jpg', '/uploads/ngatea-sep-2026/masons4.jpg', '/uploads/ngatea-sep-2026/masons5.jpg', '/uploads/ngatea-sep-2026/masons6.jpg', '/uploads/ngatea-sep-2026/masons7.jpg', '/uploads/ngatea-sep-2026/masons8.jpg', '/uploads/ngatea-sep-2026/masons9.jpg', '/uploads/ngatea-sep-2026/masons10.jpg']::text[]
            WHERE "Slug" = 'ngatea-masons-way' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/masons1.jpg', '/uploads/ngatea-sep-2026/masons2.jpg', '/uploads/ngatea-sep-2026/masons3.jpg', '/uploads/ngatea-sep-2026/masons4.jpg']::text[];
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/hale1.jpg', '/uploads/ngatea-sep-2026/hale2.jpg', '/uploads/ngatea-sep-2026/hale3.jpg', '/uploads/ngatea-sep-2026/hale4.jpg']::text[]
            WHERE "Slug" = 'ngatea-hale-place' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/hale1.jpg', '/uploads/ngatea-sep-2026/hale2.jpg', '/uploads/ngatea-sep-2026/hale3.jpg', '/uploads/ngatea-sep-2026/hale4.jpg', '/uploads/ngatea-sep-2026/hale5.jpg', '/uploads/ngatea-sep-2026/hale6.jpg', '/uploads/ngatea-sep-2026/hale7.jpg', '/uploads/ngatea-sep-2026/hale8.jpg', '/uploads/ngatea-sep-2026/hale9.jpg', '/uploads/ngatea-sep-2026/hale10.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/weddell1.jpg', '/uploads/ngatea-sep-2026/weddell2.jpg', '/uploads/ngatea-sep-2026/weddell3.jpg', '/uploads/ngatea-sep-2026/weddell4.jpg']::text[]
            WHERE "Slug" = 'ngatea-weddell-place' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/weddell1.jpg', '/uploads/ngatea-sep-2026/weddell2.jpg', '/uploads/ngatea-sep-2026/weddell3.jpg', '/uploads/ngatea-sep-2026/weddell4.jpg', '/uploads/ngatea-sep-2026/weddell5.jpg', '/uploads/ngatea-sep-2026/weddell6.jpg', '/uploads/ngatea-sep-2026/weddell7.jpg', '/uploads/ngatea-sep-2026/weddell8.jpg', '/uploads/ngatea-sep-2026/weddell9.jpg', '/uploads/ngatea-sep-2026/weddell10.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/masonic1.jpg', '/uploads/ngatea-sep-2026/masonic2.jpg', '/uploads/ngatea-sep-2026/masonic3.jpg', '/uploads/ngatea-sep-2026/masonic4.jpg']::text[]
            WHERE "Slug" = 'ngatea-masonic-place' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/masonic1.jpg', '/uploads/ngatea-sep-2026/masonic2.jpg', '/uploads/ngatea-sep-2026/masonic3.jpg', '/uploads/ngatea-sep-2026/masonic4.jpg', '/uploads/ngatea-sep-2026/masonic5.jpg', '/uploads/ngatea-sep-2026/masonic6.jpg', '/uploads/ngatea-sep-2026/masonic7.jpg', '/uploads/ngatea-sep-2026/masonic8.jpg', '/uploads/ngatea-sep-2026/masonic9.jpg', '/uploads/ngatea-sep-2026/masonic10.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/lodge1.jpg', '/uploads/ngatea-sep-2026/lodge2.jpg', '/uploads/ngatea-sep-2026/lodge3.jpg', '/uploads/ngatea-sep-2026/lodge4.jpg']::text[]
            WHERE "Slug" = 'ngatea-lodge-drive' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/lodge1.jpg', '/uploads/ngatea-sep-2026/lodge2.jpg', '/uploads/ngatea-sep-2026/lodge3.jpg', '/uploads/ngatea-sep-2026/lodge4.jpg', '/uploads/ngatea-sep-2026/lodge5.jpg', '/uploads/ngatea-sep-2026/lodge6.jpg', '/uploads/ngatea-sep-2026/lodge7.jpg', '/uploads/ngatea-sep-2026/lodge8.jpg', '/uploads/ngatea-sep-2026/lodge9.jpg', '/uploads/ngatea-sep-2026/lodge10.jpg']::text[];
            """);
        migrationBuilder.Sql("""
            UPDATE "MarketingContents"
            SET "Images" = ARRAY['/uploads/ngatea-sep-2026/masons1.jpg', '/uploads/ngatea-sep-2026/masons2.jpg', '/uploads/ngatea-sep-2026/masons3.jpg', '/uploads/ngatea-sep-2026/masons4.jpg']::text[]
            WHERE "Slug" = 'ngatea-masons-way' AND "Village" = 'Ngatea' AND "Kind" = 'area'
              AND "Images" = ARRAY['/uploads/ngatea-sep-2026/masons1.jpg', '/uploads/ngatea-sep-2026/masons2.jpg', '/uploads/ngatea-sep-2026/masons3.jpg', '/uploads/ngatea-sep-2026/masons4.jpg', '/uploads/ngatea-sep-2026/masons5.jpg', '/uploads/ngatea-sep-2026/masons6.jpg', '/uploads/ngatea-sep-2026/masons7.jpg', '/uploads/ngatea-sep-2026/masons8.jpg', '/uploads/ngatea-sep-2026/masons9.jpg', '/uploads/ngatea-sep-2026/masons10.jpg']::text[];
            """);
    }
}
