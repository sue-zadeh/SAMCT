import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../security/api'
import type { GalleryEntry } from './marketing'
import MarketingContact from './marketing-contact'

const priceFormat = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 })
export default function MarketingGallery({ entry: selectedEntry, initialPhotoIndex = 0, onClose }: { entry: GalleryEntry; initialPhotoIndex?: number; onClose: () => void }) {
  const [photoIndex, setPhotoIndex] = useState(initialPhotoIndex)
  return (
    <Modal show onHide={onClose} size="xl" centered scrollable aria-labelledby="marketing-detail-title">
      <>
        <Modal.Header closeButton><Modal.Title as="h2" id="marketing-detail-title" className="h4">{selectedEntry.title}
        </Modal.Title></Modal.Header>
        <Modal.Body>

          <p className="small fw-semibold text-primary">{selectedEntry.kind === 'unit' ? 'Individual home' : selectedEntry.kind === 'area' ? 'Street area within the village' : 'Village information'}</p>
          <p className="text-secondary">{selectedEntry.village}{selectedEntry.address && ` · ${selectedEntry.address}`}
          </p>
          {selectedEntry.priceNzd != null &&
          <p className="h5">{priceFormat.format(selectedEntry.priceNzd)} NZD · ORA · {selectedEntry.availability}
          </p>}

          <p style={{ whiteSpace: 'pre-line' }}>{selectedEntry.description}
           </p>
          {selectedEntry.sourceLabel &&
          <p className="small text-secondary">{selectedEntry.sourceLabel}. Contact the team to confirm current details.
          </p>}
          {selectedEntry.kind === 'area' && <p className="rounded-3 bg-light p-3 small">This gallery introduces the street area. Photos may show different homes or example interiors, alongside an aerial or development image. Reference interiors do not confirm the layout or finish of an available home. Ask the team to confirm the photos for the specific unit you are considering.</p>}
          {selectedEntry.kind === 'area' && selectedEntry.images.some(image => /^\/uploads\/ngatea-sep-2026\/masons(?:[5-9]|10)\.jpg$/.test(image)) && <p className="small text-secondary">Additional interiors were supplied as staged examples in the Masons Way folder. Their source filenames identify 71 Darlington St; they are not verified photos of 11 or 1A Masons Way.</p>}
          <MarketingContact contactName={selectedEntry.contactName} contactPhone={selectedEntry.contactPhone} />
          {selectedEntry.images.length > 0 &&

          <div aria-label="Photo gallery">
            <img src={`${API_BASE_URL}${selectedEntry.images[photoIndex]}`}
              alt={`${selectedEntry.title}, image ${photoIndex + 1}`}
              className="w-100 rounded-3 bg-light"
              style={{ height: 'min(55vh, 520px)', objectFit: 'contain' }} />

            <div className="d-flex align-items-center justify-content-between gap-2 my-3">
              <button type="button" className="btn btn-outline-primary" disabled={photoIndex === 0}
                onClick={() => setPhotoIndex(index => index - 1)}>Previous
              </button>
              <span role="status" className="text-center">Image {photoIndex + 1} of {selectedEntry.images.length}
               </span>
              <button type="button" className="btn btn-outline-primary"
                disabled={photoIndex === selectedEntry.images.length - 1}
                onClick={() => setPhotoIndex(index => index + 1)}>Next
               </button>

            </div>

            <div className="d-flex gap-2 overflow-auto pb-2">{selectedEntry.images.map((image, index) =>
              <button type="button" key={`${image}-${index}`}
                className={`btn p-1 flex-shrink-0 ${index === photoIndex ? 'btn-primary' : 'btn-outline-secondary'}`}
                aria-label={`Show image ${index + 1}`} aria-pressed={index === photoIndex}
                onClick={() => setPhotoIndex(index)}><img src={`${API_BASE_URL}${image}`}
                alt="" width={88} height={66} loading="lazy" style={{ objectFit: 'cover' }} />
              </button>)}

              </div>
          </div>}

        </Modal.Body>

        <Modal.Footer><Link to="/contactUs" className="btn btn-primary" onClick={onClose}>Ask about this {selectedEntry.kind === 'unit' ? 'home' : selectedEntry.kind === 'area' ? 'area' : 'village'}</Link>
        <button type="button" className="btn btn-outline-dark" onClick={onClose}>Close</button></Modal.Footer>
      </>
    </Modal>
  )
}
