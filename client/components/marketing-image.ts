import { API_BASE_URL } from '../security/api'

// Show source-attributed public property photos from Richardsons.
// Local SAMCT photos continue to use the same-origin API.
export function marketingImageSrc(image: string): string {
  if (
    image.startsWith('https://webimages.propertysuite.co.nz/richardsons/') ||
    image.startsWith('https://richardsons.web.propertysuite.co.nz/GetImage/')
  ) {
    return image
  }
  return `${API_BASE_URL}${image}`
}
