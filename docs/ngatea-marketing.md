# Ngatea marketing content — October 2026 update

Source: client-supplied **Masonics A4 Booklet - Sep 26 - Print Version(1).pdf**, 24 pages. SHA-256: `46a9299ae6723b05717496a026927f65f26c05c5e9cad6448bfe620dcf16d773`. The Windows folder visible in the screenshot is `D:\Freelancing\SAMCT\marketing\Masonics\Masonics`; its original files were not accessible during the initial PDF import. The later email-source import below adds web-sized renditions from the supplied street folders.

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

Photos are named by area (`hale1.jpg`–`hale10.jpg`, `lodge1.jpg`–`lodge10.jpg`, and the same pattern for Weddell, Masonic and Masons). The fourth area image is its map/development image. Unit advert photos use the unit number in their filename.

## Gallery and contact follow-up — 12 October 2026

- The page labels individual homes separately from street-area guides. Both grids show four cards per row on wide screens (1200 px and above), two on tablets and one on phones. A village notice explains when both sections belong to the same village. Area photos may show different homes or example interiors; they must not be assigned to an individual advert without confirmation.
- Cover images open the same accessible photo/details dialog as the details button, including keyboard activation and return of focus when closed. Static card text has a normal cursor. Overview and local-information images also open their galleries. Expanded FAQ answers have a pale blue background.
- `ExpandMarketingGalleriesAndContacts` adds `ContactName` and `ContactPhone` to PostgreSQL and sets the booklet's **Avalon or Hayley / 07 867 7800** contact for the existing Ngatea homes, areas and contact entry. It preserves descriptions, photo arrays and publication settings. Managers and administrators can edit both contact fields; the public cards and dialogs provide a phone link. Published operational property cards use the published contact entry for their own village when available.
- Brochure entries now support **30 images**, including any aerial/map image. Upload at most **10 new photos per save**, each JPEG/PNG at most **2 MB**. The browser, API and database enforce the total; server validation also rejects oversized batches, duplicate/foreign retained images and invalid contact numbers. Existing operational `VillageProperties` records continue to use ten photo slots.
- Concurrent photo downloads keep malware scanning enabled: four scans run at once, with at most sixteen waiting. The same 15-second deadline covers waiting and scanning; saturation, timeout or scanner failure still blocks the transfer. This prevents a normal gallery image burst from immediately failing on its fifth scan. Playwright checks every supplied brochure image in batches of eight concurrent downloads and verifies that all card images actually load.
- Apply the new migration before starting the updated API. Rolling it back removes the new contact fields and requires every brochure entry to have at most ten images; it does not silently truncate a gallery. Back up before rollback.
- The newly supplied PDF is the same booklet: page 5 has one photo per home advert; each area profile has three home photos and an aerial/development image. No original photos have been added in this follow-up. Screenshots show folders containing more photos, but the actual JPEGs were not attached or available in the repository. That limitation was resolved by the later email-source import below; labels identifying example interiors remain intact.

To add photos after obtaining the originals, open **My Village → Manage brochure content** (manager) or **Village Property Data → Manage brochure content** (administrator), choose the matching area/home, and add photos in batches. Save between batches. Do not run `seed-e2e.mjs` on a working database.

## Supplied email photos and unit editor — 14 October 2026

The forwarded **Photos** email dated 23 September links to the Masonics folder supplied by Richardsons. It groups photos **by street**, not by individual unit. Thirty additional web-sized JPEG renditions are now included under `server/Content/Marketing/ngatea-sep-2026`, six per street. They are copies of the supplied photographs, not generated images. [The source manifest](marketing-source-photos.json) records each filename, source folder, dimensions and SHA-256; the private sharing link is not stored in the repository.

Each street gallery now contains **ten images**: the three booklet home photos, its aerial/development image in position four, and six more supplied photos. Reference-finish watermarks are retained. The Weddell originals are unlabelled, so the page's area-gallery notice explicitly explains that photos are representative and the specific available home must be confirmed. The Masons Way folder contains staged interiors with `71_Darlington_St` in their filenames. Those images have a specific notice and are not assigned to 11 or 1A Masons Way. The four individual page-5 adverts still contain one identifiable photo each; an address-to-photo mapping is needed before attaching other street-folder photos to those homes.

`ImportSuppliedStreetPhotos` is a **data-only EF migration**. It appends photos only where the slug, village, kind and original four-image array all match. It does not overwrite staff-edited image arrays, copy, contact details or publication choices. Its rollback restores four images only where the ten-image array still exactly matches this import. Staff-customized galleries are left for manual review in the brochure editor. The schema already has `MarketingImageUrl1` through `MarketingImageUrl10`; do not add duplicate columns manually.

The operational Units form (My Village) now supports selecting multiple photos, previewing existing/new photos, replacing a position, removing/undoing a saved photo, and saving anywhere from zero to ten photos. Vacant homes can be saved with zero residents and no resident email. The API rejects unknown/duplicate file positions, invalid removal positions, and removing and replacing the same photo in one request. Existing role/village authorization, CSRF, image-type/size checks and malware scanning remain active. Removing/replacing/unpublishing a photo withdraws its public database reference; files are retained for the reviewed retention procedure.

Photo thumbnails on marketing cards open their exact image in the accessible gallery. The four-column desktop layout, responsive smaller layouts, contacts and contrasting FAQ answers are retained. Playwright covers legacy usernames with spaces (including required staff MFA), field errors, ten-photo creation/editing/publication, removed-photo access, invalid batches, CSRF and cross-village restrictions.

## Original PDF photo mapping

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
