// Dated, temporary Richardsons listing. Images are bundled locally from
// client/assets/Whitianga so the site does not depend on external image links.
// They show a similar unit, not necessarily the advertised property.
import type { MarketingContent } from './marketing-content-editor'

const localPhotos = Object.entries(import.meta.glob('../assets/Whitianga/seascape-*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}))
  .sort(([first], [second]) => first.localeCompare(second))
  .map(([, image]) => image as string)

export const whitiangaPublicListing: MarketingContent[] = [
  {
    "id": -201,
    "village": "Whitianga",
    "kind": "overview",
    "title": "Whitianga Independent Lifestyle Village",
    "description": "Independent retirement living near the centre of Whitianga, close to shops, supermarkets, medical care and the beach. Village homes are offered under an Occupation Right Agreement (ORA), not as freehold properties.\n\nThis information is a temporary guide based on the current Richardsons listing. Official marketing photos and updated details are being requested from Caroline and Abby. The present listing images show a similar refurbished home, not necessarily the home for sale.",
    "address": "",
    "images": localPhotos[1] ? [localPhotos[1]] : [],
    "priceNzd": null,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "",
    "contactPhone": ""
  },
  {
    "id": -202,
    "village": "Whitianga",
    "kind": "unit",
    "title": "23 Seascape Avenue, Whitianga",
    "description": "A two-bedroom, 122 m² home on a corner site, set back from the road. Richardsons describes double glazing, LED lights, an updated kitchen and mobility-friendly bathroom, new carpets, a heat pump, a hot-water cylinder, a separate laundry, an internal garage and storage. Lawns and exterior maintenance are taken care of. Close to local shops, healthcare and the beach.\n\nThe home is offered under an Occupation Right Agreement (ORA), not freehold ownership. Ask Abby to confirm the advertised price, current availability, service fees and agreement terms.\n\nIMPORTANT PHOTO NOTE: The agent says these pictures show a SIMILAR home. Some furniture has been virtually staged. They are reference pictures, not verified photos of 23 Seascape Avenue.",
    "address": "23 Seascape Avenue, Whitianga",
    "images": localPhotos,
    "priceNzd": 650000,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "Abby Lawrence",
    "contactPhone": "021 179 5906"
  },
  {
    "id": -203,
    "village": "Whitianga",
    "kind": "area",
    "title": "Seascape Avenue",
    "description": "Seascape Avenue is part of Whitianga Independent Lifestyle Village. Richardsons describes this village as being near the town centre, supermarkets, medical centre and beach.\n\nThe aerial and house images here are reference photos from the 23 Seascape Avenue advertisement. The house image shows a similar unit, not every home on the street.",
    "address": "Seascape Avenue, Whitianga",
    "images": [localPhotos[1], localPhotos[0]].filter((photo): photo is string => Boolean(photo)),
    "priceNzd": null,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "Abby Lawrence",
    "contactPhone": "021 179 5906"
  },
  {
    "id": -204,
    "village": "Whitianga",
    "kind": "faq",
    "title": "Is the home freehold?",
    "description": "No. The Richardsons listing explains that homes are offered under an Occupation Right Agreement (ORA), not as freehold purchases. Ask the village team for the agreement and current fees.",
    "address": "",
    "images": [],
    "priceNzd": null,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "",
    "contactPhone": ""
  },
  {
    "id": -205,
    "village": "Whitianga",
    "kind": "faq",
    "title": "Are the photos of the exact home?",
    "description": "Not yet. Richardsons labels the current photographs as pictures of a similar unit. Some furniture is virtually staged. Contact Abby for the latest photos of the home being advertised.",
    "address": "",
    "images": [],
    "priceNzd": null,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "",
    "contactPhone": ""
  },
  {
    "id": -206,
    "village": "Whitianga",
    "kind": "town",
    "title": "Life in Whitianga",
    "description": "Whitianga is a coastal town on the Coromandel Peninsula. Richardsons describes this village as close to the centre of town, supermarkets, a medical centre and the beach. The village team can help arrange a viewing.",
    "address": "",
    "images": [],
    "priceNzd": null,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "",
    "contactPhone": ""
  },
  {
    "id": -207,
    "village": "Whitianga",
    "kind": "contact",
    "title": "Ask about Whitianga homes",
    "description": "For viewing times, updated photos, current prices and details of the Occupation Right Agreement, contact Abby Lawrence at Richardsons Real Estate Whitianga.\n\nMobile: 021 179 5906\nOffice: 07 866 2373\nListing ID: RW5199\n\nOfficial village marketing information from Caroline and Abby will replace these provisional details when supplied.",
    "address": "",
    "images": [],
    "priceNzd": null,
    "availability": "Enquire",
    "sourceLabel": "Richardsons Real Estate · RW5199 · checked 4 November 2026",
    "sourceUrl": "https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/",
    "contactName": "Abby Lawrence",
    "contactPhone": "021 179 5906"
  }
]
