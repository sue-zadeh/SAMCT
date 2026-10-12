import { API_BASE_URL, apiFetch } from '../security/api'
import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './navbar'
import { Link } from 'react-router-dom'
import MarketingContact, { type MarketingContactDetails } from './marketing-contact'
const MarketingGallery = lazy(() => import('./marketing-gallery'))
import type { MarketingContent } from './marketing-content-editor'

type MarketingProperty = {
  id: number
  village: string
  unitNumber: string
  address: string
  marketingTitle: string
  marketingDescription: string
} & Partial<Record<`marketingImageUrl${number}`, string>>

export type GalleryEntry = MarketingContactDetails & {
  key: string
  kind: 'unit' | 'area' | 'information'
  village: string
  title: string
  description: string
  address: string
  images: string[]
  sourceLabel?: string
  priceNzd?: number | null
  availability?: string
}

const priceFormat = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 })
const normaliseAddress = (address: string) => address.toLowerCase().replace(/[^a-z0-9]/g, '')
const contentEntry = (content: MarketingContent): GalleryEntry => ({ ...content, key: `brochure-${content.id}`, kind: content.kind === 'unit' ? 'unit' : content.kind === 'area' ? 'area' : 'information' })
const imageCount = (count: number) => `${count} ${count === 1 ? 'image' : 'images'}`

function Marketing() {
  const [properties, setProperties] = useState<MarketingProperty[]>([])
  const [content, setContent] = useState<MarketingContent[]>([])
  const [selectedVillage, setSelectedVillage] = useState('All')
  const [selectedEntry, setSelectedEntry] = useState<GalleryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true); setError('')
      try {
        const responses = await Promise.all([
          apiFetch(`${API_BASE_URL}/api/village-properties/marketing`, { signal: controller.signal }),
          apiFetch(`${API_BASE_URL}/api/marketing-content`, { signal: controller.signal }),
        ])
        if (responses.some(response => !response.ok)) throw new Error('Could not load village information. Please try again or contact SAMCT.')
        const [propertyData, contentData] = await Promise.all(responses.map(response => response.json()))
        if (!Array.isArray(propertyData) || !Array.isArray(contentData)) throw new Error('Could not load village information. Please try again.')
        if (!controller.signal.aborted) { setProperties(propertyData); setContent(contentData) }
      } catch {
        if (!controller.signal.aborted) setError('We could not connect to the village information service. Please try again or contact SAMCT.')
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [attempt])

  const visibleContent = content.filter(entry => selectedVillage === 'All' || entry.village === selectedVillage)
  const villageProperties = properties.filter(property => selectedVillage === 'All' || property.village === selectedVillage)
  const villageContact = (village: string) => content.find(entry => entry.village === village && entry.kind === 'contact')
  const propertyEntries: GalleryEntry[] = villageProperties.map(property => ({
    key: `property-${property.id}`, kind: 'unit', village: property.village, address: property.address,
    title: property.marketingTitle || `Unit ${property.unitNumber}`,
    description: property.marketingDescription || 'Contact SAMCT for more information about this home.',
    images: Array.from({ length: 10 }, (_, index) => property[`marketingImageUrl${index + 1}`] || '').filter(image => image.trim()),
    contactName: villageContact(property.village)?.contactName,
    contactPhone: villageContact(property.village)?.contactPhone,
  }))
  // A current, published property record takes precedence over a dated brochure advert for the same address.
  const currentAddresses = new Set(propertyEntries.map(property => normaliseAddress(property.address)))
  const unitEntries = [...propertyEntries, ...visibleContent.filter(entry => entry.kind === 'unit' && !currentAddresses.has(normaliseAddress(entry.address))).map(contentEntry)]
  const areas = visibleContent.filter(entry => entry.kind === 'area')
  const faqs = visibleContent.filter(entry => entry.kind === 'faq')
  const information = visibleContent.filter(entry => ['steps', 'contact', 'town'].includes(entry.kind))
  const galleryVillages = [...new Set([...unitEntries, ...areas].map(entry => entry.village))]

  function showDetails(entry: GalleryEntry) { setSelectedEntry(entry) }
  function imageButton(entry: GalleryEntry, className = '', overview = false) {
    return <button type="button" className={`marketing-photo-button ${className}`} onClick={() => showDetails(entry)}
      aria-label={`Open photos for ${entry.title}`} aria-haspopup="dialog">
      <img src={`${API_BASE_URL}${entry.images[0]}`} alt={entry.title} loading="lazy" decoding="async"
        width={640} height={overview ? 426 : 360} className="w-100" style={{ height: overview ? 'auto' : 220, objectFit: 'cover' }} />
      <span className="marketing-photo-label">View {imageCount(entry.images.length)}</span>
    </button>
  }

  function card(entry: GalleryEntry) {
    const isArea = entry.kind === 'area'
    return <div className="col-md-6 col-xl-4" key={entry.key}>
      <article className="samct-card marketing-card h-100 overflow-hidden border rounded-4 shadow-sm bg-white d-flex flex-column">
        {entry.images[0] && imageButton(entry)}
        <div className="p-4 d-flex flex-column flex-grow-1">
          <div className="d-flex gap-2 flex-wrap mb-2">
            <span className="badge bg-primary">{entry.village}</span>
            <span className="badge marketing-kind-badge">{isArea ? 'Street area' : 'Individual home'}</span>
            {entry.availability && !isArea &&
            <span className={`badge ${entry.availability === 'Under offer' ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>{entry.availability}
            </span>}
            </div>
          <h3 className="h5 fw-bold">{entry.title}</h3>
          {entry.priceNzd != null && <p className="h5 text-primary">{priceFormat.format(entry.priceNzd)}
            <span className="small text-secondary">NZD · ORA</span>
            </p>}
          {entry.address && entry.address !== entry.title &&
          <p className="text-secondary small">{entry.address}</p>}
          <p className="text-secondary"
            style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {entry.description}
          </p>
          {entry.sourceLabel && <p className="small text-secondary">{entry.sourceLabel}{!isArea && ' · Confirm current price and availability.'}
            </p>}
          <div className="mt-auto"><MarketingContact contactName={entry.contactName} contactPhone={entry.contactPhone} /></div>
          <button className="btn btn-outline-primary mt-auto w-100" onClick={() => showDetails(entry)}
          type="button" aria-haspopup="dialog" aria-label={`View ${entry.title}`}>View photos &amp; details{entry.images.length > 0 && ` · ${imageCount(entry.images.length)}`}
          </button>
        </div>
      </article>
    </div>
  }

  return <>
    <Navbar userType="public" />
    <main className="container py-5 marketing-page">
      <section className="samct-card p-4 p-md-5 text-center mb-4 shadow-sm border rounded-4 bg-white">
        <p className="text-uppercase text-primary fw-semibold mb-2">SAMCT Villages</p>
        <h1 className="h2 fw-bold mb-3">Independent village living in Ngatea and Whitianga</h1>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: 800 }}>Explore village areas, homes and photo galleries. Find out about independent living, then contact the team to arrange a visit and confirm what is available.</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/contactUs" className="btn btn-primary px-4 samct-button">Contact SAMCT</Link>
          <a href="#marketing-listings" className="btn btn-outline-primary px-4 samct-button">Individual homes</a>
          <a href="#marketing-areas" className="btn btn-outline-primary px-4 samct-button">Village areas</a>
        </div>
      </section>
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-4" role="group" aria-label="Filter by village">
        {['All', 'Ngatea', 'Whitianga'].map(village => <button key={village} className={`btn ${selectedVillage === village ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={selectedVillage === village} onClick={() => setSelectedVillage(village)}>{village}</button>)}
      </div>
      {loading && <p role="status" className="text-center py-4">Loading village information…</p>}
      {error && <div role="alert" className="alert alert-warning"><p>{error}</p><button className="btn btn-outline-dark" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
      {!loading && !error && <>
        {visibleContent.filter(entry => entry.kind === 'overview').map(entry => <section key={entry.id} className="row g-4 align-items-center mb-5">
          <div className={entry.images.length ? 'col-lg-7' : 'col-12'}><h2 className="h3">{entry.title}</h2><p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{entry.description}</p><p className="small text-secondary">{entry.sourceLabel}</p></div>
          {!!entry.images.length && <div className="col-lg-5">{imageButton(contentEntry(entry), 'rounded-4', true)}</div>}
        </section>)}
        {galleryVillages.length === 1 && <p className="marketing-village-note rounded-3 p-3 mb-4">
          The homes and street areas below are all in <strong>{galleryVillages[0]}</strong>. Start with an individual home, or explore the areas within the village.
        </p>}
        <section id="marketing-listings" className="mb-5" aria-labelledby="homes-title">
          <h2 id="homes-title" className="h3 mb-3">Individual homes</h2>
          <p className="text-secondary">Each card below is one home at a specific address, with its own photos and advertised details. Select a photo to open the gallery and full description. Confirm the latest price, availability and Occupation Right Agreement with the contact shown.</p>
          {unitEntries.length ? <div className="row g-4">{unitEntries.map(entry => card(entry))}</div> : <p className="alert alert-info">No homes are currently listed for this village. Contact SAMCT to ask about availability.</p>}
        </section>
        <section id="marketing-areas" className="mb-5" aria-labelledby="areas-title">
          <h2 id="areas-title" className="h3 mb-3">Street areas within the village</h2>
          {areas.length > 0 ? <>
            <p className="text-secondary">These guides introduce whole street areas and show example homes, interiors and surroundings. A street area contains several homes; its gallery does not show one particular home for offer. See Individual homes above for adverts at specific addresses.</p>
            <div className="row g-4">{areas.map(entry => card(contentEntry(entry)))}</div>
          </> : <p className="text-secondary">Area guides have not been added for this village yet. Contact SAMCT to learn more.</p>}
        </section>
        {faqs.length > 0 && <section className="mb-5" aria-labelledby="faq-title"><h2 id="faq-title" className="h3 mb-3">Your questions answered</h2>
          {faqs.map(entry => <details key={entry.id} className="marketing-faq border rounded-3 mb-3 overflow-hidden">
            <summary className="fw-semibold p-3">{entry.title}</summary>
            <div className="marketing-faq-answer p-3 border-top"><p className="mb-2" style={{ whiteSpace: 'pre-line' }}>{entry.description}</p><p className="small text-secondary mb-0">{entry.sourceLabel}</p></div>
          </details>)}
        </section>}
        {information.length > 0 && <section className="row g-4 mb-4" aria-label="Visiting and local information">{information.map(entry => <div key={entry.id} className="col-lg-4"><article className="border rounded-4 p-4 h-100 bg-white">
          <h2 className="h4">{entry.title}</h2><p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{entry.description}</p>
          {entry.images[0] && imageButton(contentEntry(entry), 'rounded-3 mb-3', true)}
          <MarketingContact contactName={entry.contactName} contactPhone={entry.contactPhone} />
          <p className="small text-secondary">{entry.sourceLabel}</p>{entry.kind === 'contact' && <Link to="/contactUs" className="btn btn-primary">Contact SAMCT</Link>}
        </article></div>)}</section>}
      </>}
    </main>
    {selectedEntry && <Suspense fallback={<p role="status" className="text-center">Opening photos…</p>}>
      <MarketingGallery key={selectedEntry.key} entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </Suspense>}
  </>
}

export default Marketing
