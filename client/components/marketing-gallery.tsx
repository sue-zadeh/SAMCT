import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../security/api'
import type { GalleryEntry } from './marketing'

const priceFormat = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 })
export default function MarketingGallery({ entry: selectedEntry, onClose }: { entry: GalleryEntry; onClose: () => void }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  return (
    <Modal show onHide={onClose} size="xl" centered scrollable aria-labelledby="marketing-detail-title">
      <>
        <Modal.Header closeButton><Modal.Title as="h2" id="marketing-detail-title" className="h4">{selectedEntry.title}</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="text-secondary">{selectedEntry.village}{selectedEntry.address && ` · ${selectedEntry.address}`}</p>
          {selectedEntry.priceNzd != null && <p className="h5">{priceFormat.format(selectedEntry.priceNzd)} NZD · ORA · {selectedEntry.availability}</p>}
          <p style={{ whiteSpace: 'pre-line' }}>{selectedEntry.description}</p>
          {selectedEntry.sourceLabel && <p className="small text-secondary">{selectedEntry.sourceLabel}. Contact the team to confirm current details.</p>}
          {selectedEntry.images.length > 0 && <div aria-label="Photo gallery">
            <img src={`${API_BASE_URL}${selectedEntry.images[photoIndex]}`} alt={`${selectedEntry.title}, photo ${photoIndex + 1}`} className="w-100 rounded-3 bg-light" style={{ height: 'min(55vh, 520px)', objectFit: 'contain' }} />
            <div className="d-flex align-items-center justify-content-between gap-2 my-3">
              <button className="btn btn-outline-primary" disabled={photoIndex === 0} onClick={() => setPhotoIndex(index => index - 1)}>Previous photo</button>
              <span role="status">Photo {photoIndex + 1} of {selectedEntry.images.length}</span>
              <button className="btn btn-outline-primary" disabled={photoIndex === selectedEntry.images.length - 1} onClick={() => setPhotoIndex(index => index + 1)}>Next photo</button>
            </div>
            <div className="d-flex gap-2 overflow-auto pb-2">{selectedEntry.images.map((image, index) => <button key={`${image}-${index}`} className={`btn p-1 flex-shrink-0 ${index === photoIndex ? 'btn-primary' : 'btn-outline-secondary'}`} aria-label={`Show photo ${index + 1}`} aria-pressed={index === photoIndex} onClick={() => setPhotoIndex(index)}><img src={`${API_BASE_URL}${image}`} alt="" width={88} height={66} loading="lazy" style={{ objectFit: 'cover' }} /></button>)}</div>
          </div>}
        </Modal.Body>
        <Modal.Footer><Link to="/contactUs" className="btn btn-primary" onClick={onClose}>Ask about this {selectedEntry.kind === 'unit' ? 'home' : 'area'}</Link><button className="btn btn-outline-dark" onClick={onClose}>Close</button></Modal.Footer>
      </>
    </Modal>
  )
}
