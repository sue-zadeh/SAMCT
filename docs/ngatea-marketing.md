# Ngatea marketing content — October 2026 update

Source: client-supplied **Masonics A4 Booklet - Sep 26 - Print Version(1).pdf**, 24 pages. SHA-256: `46a9299ae6723b05717496a026927f65f26c05c5e9cad6448bfe620dcf16d773`. The Windows folder visible in the screenshot is `D:\Freelancing\SAMCT\marketing\Masonics\Masonics`; its original files were not accessible.

## Content decisions

- Store brochure copy in PostgreSQL rather than hard-coding it into the page. The migration creates and seeds `MarketingContents` once; API updates persist staff edits. The JSON file under `server/data/` records the original seed for review and isolated test resets, and is not a production fallback.

- Five area profiles describe Hale Place, Weddell Place, Masonic Place, Lodge Drive and Masons Way. Each has three representative home photos and one map/development image. The four individual unit adverts use the photos shown with their adverts on page 5. The 1A Masons Way description keeps the brochure’s qualification that the photograph shows a staged unit. The overview and town section each have one photo.

- The first unit image object on page 5 is an unused placeholder illustration. It was excluded. Photos were extracted from embedded image objects, resized to at most 1440 × 1100, converted to JPEG and stripped of image metadata. Text and page layouts were not passed off as original property photos.

- Page 4 makes broad occupancy statements that conflict with page 5 adverts. The page does not publish a blanket claim that every home is occupied or available. Each advert shows the booklet date and asks visitors to confirm current availability. No bedroom/room counts beyond the supplied material were invented.

- No new resident accounts, occupancy records or operational properties are created. `VillageProperties` gains only image columns 6–10, with empty defaults; existing property data is preserved. Published operational listings take precedence over brochure adverts with the same normalized full address. Each brochure advert has its own publication switch. To withdraw a home completely, unpublish its brochure advert as well as any operational listing for that address.

- Prices are NZD and associated with an ORA, rather than represented as freehold sales. Wording is condensed from the booklet, with current terms to be confirmed with the village team. The booklet identifies the operator as SAMPL; this has not silently been changed to SAMCT.

## Applying the change

1. Back up the target database using your normal backup process.
2. Deploy the API and its `Content/Marketing` assets together. Apply EF migrations using `dotnet run --project server --no-launch-profile -- --migrate` with the intended environment and connection string.
3. Start the API on port 5072 and the frontend on port 5173 for local preview. Open `/marketing`.
4. Managers edit their own village’s brochure content in My Village. Admins use Village Property Data. Confirm prices/statuses with the client before marking them as newly verified.

The migration seeds publication only for the specifically supplied brochure content. Do not re-run seed scripts against a development/production database. `scripts/seed-e2e.mjs` remains destructive only within its guarded disposable local `_e2e` database.

Rolling this migration back removes the new brochure table and photo columns 6–10. Export any staff edits/new photo references before a rollback. Uploaded files are not deleted automatically; use a reviewed retention process for unreferenced files.

Photos are named by area (`hale1.jpg`–`hale4.jpg`, `lodge1.jpg`–`lodge4.jpg`, and the same pattern for Weddell, Masonic and Masons). The fourth area image is its map/development image. Unit advert photos use the unit number in their filename.

## Source photo mapping

| JPEG | PDF page | Embedded image object | Export dimensions |
| --- | ---: | ---: | --- |
| village-aerial.jpg | 1 | 634 | 1440 × 960 |
| hale1.jpg | 7 | 689 | 1440 × 960 |
| hale2.jpg | 7 | 692 | 1440 × 960 |
| hale3.jpg | 7 | 695 | 1440 × 960 |
| hale4.jpg | 6 | 684 | 1392 × 736 |
| weddell1.jpg | 9 | 705 | 1440 × 960 |
| weddell2.jpg | 9 | 708 | 1440 × 960 |
| weddell3.jpg | 9 | 711 | 1440 × 960 |
| weddell4.jpg | 8 | 700 | 741 × 534 |
| masonic1.jpg | 11 | 721 | 1440 × 960 |
| masonic2.jpg | 11 | 724 | 1440 × 960 |
| masonic3.jpg | 11 | 727 | 1440 × 960 |
| masonic4.jpg | 10 | 716 | 1292 × 968 |
| lodge1.jpg | 13 | 737 | 1440 × 960 |
| lodge2.jpg | 13 | 740 | 1440 × 960 |
| lodge3.jpg | 13 | 743 | 1440 × 961 |
| lodge4.jpg | 12 | 732 | 1440 × 1079 |
| masons1.jpg | 15 | 753 | 1200 × 800 |
| masons2.jpg | 15 | 756 | 1440 × 960 |
| masons3.jpg | 15 | 759 | 1200 × 800 |
| masons4.jpg | 14 | 748 | 854 × 640 |
| 11-masons-way.jpg | 5 | 668 | 600 × 400 |
| 1a-masons-way.jpg | 5 | 665 | 1296 × 864 |
| 4-masonic-place.jpg | 5 | 662 | 822 × 548 |
| 14-masonic-place.jpg | 5 | 671 | 822 × 548 |
| ngatea-town.jpg | 21 | 790 | 1440 × 960 |
