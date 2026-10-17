import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../security/api'

export type UnitPhotoSlot = { url: string; file: File | null; removed: boolean }

function PhotoPreview({ photo, number }: { photo: UnitPhotoSlot; number: number }) {
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (!photo.file) { setPreview(''); return }
    const url = URL.createObjectURL(photo.file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo.file])
  const source = photo.removed ? '' : preview || (photo.url ? `${API_BASE_URL}${photo.url}` : '')
  return source
    ? <img src={source} alt={`Unit photo ${number}`} className="w-100 rounded-3" style={{ height: 150, objectFit: 'cover' }} />
    : <div className="bg-light rounded-3 d-flex align-items-center justify-content-center text-secondary" style={{ height: 150 }}>No photo</div>
}

export default function UnitPhotoEditor({ photos, onChange, disabled = false }: {
  photos: UnitPhotoSlot[]; onChange: (photos: UnitPhotoSlot[]) => void; disabled?: boolean
}) {
  const [error, setError] = useState('')
  const count = photos.filter(photo => !photo.removed && (photo.file || photo.url)).length
  const validate = (files: File[]) => {
    if (files.some(file => !/\.(jpe?g|png)$/i.test(file.name) || (file.type && !['image/jpeg', 'image/png'].includes(file.type))))
      return 'Choose JPEG or PNG photos only.'
    if (files.some(file => file.size === 0 || file.size > 2 * 1024 * 1024))
      return 'Each photo must be a non-empty file of at most 2 MB.'
    return ''
  }
  const update = (index: number, photo: UnitPhotoSlot) => onChange(photos.map((current, slot) => slot === index ? photo : current))
  const addPhotos = (files: File[]) => {
    const problem = validate(files)
    if (problem) { setError(problem); return }
    const available = photos.map((photo, index) => photo.removed || (!photo.file && !photo.url) ? index : -1).filter(index => index >= 0)
    if (files.length > available.length) { setError(`There is room for ${available.length} more photos. Each unit can have up to 10.`); return }
    const next = photos.map(photo => ({ ...photo }))
    files.forEach((file, index) => { next[available[index]] = { ...next[available[index]], file, removed: false } })
    setError(''); onChange(next)
  }
  return <fieldset className="col-12" disabled={disabled}>
    <legend className="h5 fw-bold mt-3">Unit marketing photos</legend>
    <p className="text-secondary small">Add up to 10 JPEG or PNG photos, at most 2 MB each. Fewer photos are fine. The first filled position is the cover photo. Changes apply when you save the property.</p>
    <p className="fw-semibold" aria-live="polite">{count} of 10 photos</p>
    <label htmlFor="unit-photo-batch" className="form-label">Add multiple unit photos</label>
    <input id="unit-photo-batch" className="form-control mb-3" type="file" multiple accept=".jpg,.jpeg,.png"
      onChange={event => { addPhotos(Array.from(event.target.files || [])); event.target.value = '' }} />
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    <div className="row g-3">{photos.map((photo, index) => <div className="col-sm-6 col-lg-3" key={index}>
      <div className="border rounded-3 p-2 h-100">
        <PhotoPreview photo={photo} number={index + 1} />
        <label htmlFor={`unit-photo-${index + 1}`} className="form-label mt-2">Marketing photo {index + 1}</label>
        <input id={`unit-photo-${index + 1}`} className="form-control" type="file" accept=".jpg,.jpeg,.png"
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            const problem = validate([file]); setError(problem)
            if (!problem) update(index, { ...photo, file, removed: false })
          }} />
        <p className="small text-break mt-2 mb-1">{photo.removed ? 'Will be removed when saved' : photo.file?.name || (photo.url ? 'Saved photo' : 'Empty position')}</p>
        {!photo.removed && (photo.file || photo.url) && <button type="button" className="btn btn-sm btn-outline-danger"
          onClick={() => { setError(''); update(index, { ...photo, file: null, removed: !!photo.url }) }}>Remove photo {index + 1}</button>}
        {photo.url && (photo.removed || photo.file) && <button type="button" className="btn btn-sm btn-link"
          onClick={() => { setError(''); update(index, { ...photo, file: null, removed: false }) }}>Keep saved photo {index + 1}</button>}
      </div>
    </div>)}</div>
  </fieldset>
}
