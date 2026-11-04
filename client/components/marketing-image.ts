import { API_BASE_URL } from '../security/api'

// Vite bundles Whitianga photos as versioned /assets files.
// Ngatea brochure photos remain served by the ASP.NET Core API.
export function marketingImageSrc(image: string): string {
  if (image.startsWith('/assets/') || image.startsWith('/client/assets/')) {
    return image
  }
  return `${API_BASE_URL}${image}`
}
