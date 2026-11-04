// One-time import of the Richardsons RW5199 listing images.
 // Run in GitHub Actions, whose runner can fetch the source files.
 // Keep original photo pixels, labels and agency annotations.
import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const directory = path.resolve('client/assets/Whitianga')
const rootUrl = 'https://webimages.propertysuite.co.nz/richardsons/listing-profile-main'
const listingUrl = 'https://www.richardsons.co.nz/property/RW5199/23-seascape-avenue-whitianga/'
const identifiers = Array.from({ length: 19 }, (_, i) =>
  '26C' + (i + 3).toString(16).toUpperCase().padStart(2, '0')
)
await mkdir(directory, { recursive: true })
const manifest = {
  village: 'Whitianga',
  listing: 'RW5199',
  address: '23 Seascape Avenue, Whitianga',
  source: listingUrl,
  sourceCredit: 'Richardsons Real Estate Whitianga',
  note: 'Agent images of a similar home. Some interiors are virtually staged. Keep the original labels.',
  photos: [],
}
for (let index = 0; index < identifiers.length; index++) {
  const code = identifiers[index]
  const url = `${rootUrl}/${code}/RW5199.jpg`
  const filename = `seascape-${String(index + 1).padStart(2, '0')}.jpg`
  let bytes
  let failure
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SAMCT-villages/1.0)' },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = Buffer.from(await response.arrayBuffer())
        if (data.length < 5000 || data.length > 8_000_000 ||
            data[0] !== 0xff || data[1] !== 0xd8 || data[2] !== 0xff) {
          throw new Error(`Expected original JPEG, got ${data.length} bytes (${response.headers.get('content-type')})`)
        }
        bytes = data
      } finally {
        clearTimeout(timeout)
      }
      break
    } catch (error) {
      failure = error
      console.warn(`Retry ${attempt}/3: ${filename} (${error.message})`)
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000))
    }
  }
  if (!bytes) {
    console.warn(`Skipped unavailable ${code}: ${failure?.message}`)
    continue
  }
  await writeFile(path.join(directory, filename), bytes)
  manifest.photos.push({
    file: filename,
    sourceImage: url,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
  })
  console.log(`Saved ${filename} (${bytes.length} bytes)`)
}
if (manifest.photos.length < 8 ||
    !manifest.photos.some(item => item.file === 'seascape-01.jpg') ||
    !manifest.photos.some(item => item.file === 'seascape-02.jpg')) {
  throw new Error(`Only ${manifest.photos.length} valid images, need first exterior, aerial and at least eight photos`)
}
await writeFile(path.join(directory, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`Imported ${manifest.photos.length} original Whitianga JPEGs`)
