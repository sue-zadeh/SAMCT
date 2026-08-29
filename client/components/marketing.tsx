import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import Seo from './seo'
import { API_BASE_URL } from '../lib/api'

type MarketingProperty = {
  id: number
  village: string
  unitNumber: string
  address: string
  marketingTitle: string
  marketingDescription: string
  marketingImageUrl1: string
  marketingImageUrl2: string
  marketingImageUrl3: string
  marketingImageUrl4: string
  marketingImageUrl5: string
}

function Marketing() {
  const [properties, setProperties] = useState<MarketingProperty[]>([])
  const [selectedVillage, setSelectedVillage] = useState('All')
  const [selectedProperty, setSelectedProperty] =
    useState<MarketingProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-cubic',
    })

    loadMarketingProperties()
  }, [])

  const loadMarketingProperties = async () => {
    try {
      setError('')
      const response = await fetch(
        `${API_BASE_URL}/api/village-properties/marketing`,
      )
      if (!response.ok) throw new Error('Marketing listings are temporarily unavailable.')
      const data = await response.json()
      setProperties(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Marketing listings are temporarily unavailable.',
      )
    } finally {
      setLoading(false)
    }
  }

  const villages = ['All', 'Ngatea', 'Whitianga']

  const filteredProperties =
    selectedVillage === 'All'
      ? properties
      : properties.filter((item) => item.village === selectedVillage)

  const getImages = (item: MarketingProperty) => {
    return [
      item.marketingImageUrl1,
      item.marketingImageUrl2,
      item.marketingImageUrl3,
      item.marketingImageUrl4,
      item.marketingImageUrl5,
    ].filter((image) => image && image.trim() !== '')
  }

  return (
    <>
      <Seo
        title="Village information and availability | SAMCT Villages"
        description="Explore public information and available retirement village units in Ngatea and Whitianga, and contact SAMCT for current details."
        path="/marketing"
      />
      <Navbar userType="public" />

      <main className="container py-5">
        <section
          className="samct-card p-5 text-center mb-4 shadow-sm border rounded-4 bg-white"
          data-aos="fade-down"
        >
          <p className="text-uppercase text-primary fw-semibold mb-2">
            SAMCT Villages
          </p>

          <h1 className="fw-bold mb-3">Village information and availability</h1>

          <p
            className="text-secondary  mb-4 mx-auto"
            style={{ maxWidth: '850px' }}
          >
            Explore published village information for Ngatea and Whitianga.
            Availability can change, so contact SAMCT to confirm current details.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/contactUs" className="btn btn-primary px-5 samct-button">
              Contact SAMCT
            </Link>

            <a
              href="#marketing-listings"
              className="btn btn-outline-primary px-5 samct-button"
            >
              View Available Units
            </a>
          </div>
        </section>

        <section id="marketing-listings" className="text-center mb-4" data-aos="zoom-in">
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {villages.map((village) => (
              <button
                key={village}
                className={`btn ${
                  selectedVillage === village
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => setSelectedVillage(village)}
              >
                {village}
              </button>
            ))}
          </div>
        </section>

        <section className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5" role="status">
              <div className="spinner-border text-primary" aria-hidden="true" />
              <p className="mt-3 text-secondary">Loading village information…</p>
            </div>
          ) : error ? (
            <div className="col-12">
              <div className="alert alert-warning text-center" role="alert">
                {error}{' '}
                <button className="btn btn-link p-0" onClick={loadMarketingProperties}>
                  Try again
                </button>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="col-12">
              <div className="samct-card p-5 text-center">
                <h2 className="h4 fw-bold">No published listings right now</h2>
                <p className="text-secondary">
                  Contact SAMCT for current village information and availability.
                </p>
                <Link to="/contactUs" className="btn btn-primary">Contact SAMCT</Link>
              </div>
            </div>
          ) : (
            filteredProperties.map((item) => {
              const images = getImages(item)
              const mainImage = images[0]

              return (
                <div
                  className="col-md-6 col-xl-4"
                  key={item.id}
                  data-aos="fade-up"
                >
                  <div className="samct-card h-100 overflow-hidden border rounded-4 shadow-sm bg-white">
                    {mainImage ? (
                      <img
                        src={`${API_BASE_URL}${mainImage}`}
                        alt={item.marketingTitle || item.unitNumber}
                        className="w-100"
                        style={{
                          height: '220px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light text-secondary"
                        style={{ height: '220px' }}
                      >
                        No image uploaded
                      </div>
                    )}

                    <div className="p-4">
                      <span className="badge bg-primary mb-2">
                        {item.village}
                      </span>

                      <h5 className="fw-bold">
                        {item.marketingTitle || `Unit ${item.unitNumber}`}
                      </h5>

                      <p className="text-secondary small mb-2">
                        {item.address}
                      </p>

                      <p className="text-secondary">
                        {item.marketingDescription ||
                          'No description added yet.'}
                      </p>

                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => setSelectedProperty(item)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </section>

        {selectedProperty && (
          <div
            className="modal d-block"
            tabIndex={-1}
            style={{ background: 'rgba(0,0,0,0.55)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-dialog-title"
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <div>
                    <h2 id="property-dialog-title" className="modal-title h5 fw-bold">
                      {selectedProperty.marketingTitle ||
                        `Unit ${selectedProperty.unitNumber}`}
                    </h2>
                    <p className="text-secondary mb-0">
                      {selectedProperty.village} | {selectedProperty.address}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedProperty(null)}
                    aria-label="Close property details"
                  />
                </div>

                <div className="modal-body">
                  <p className="text-secondary">
                    {selectedProperty.marketingDescription ||
                      'No description added yet.'}
                  </p>

                  <div className="row g-3">
                    {getImages(selectedProperty).map((image, index) => (
                      <div className="col-md-6" key={image}>
                        <img
                          src={`${API_BASE_URL}${image}`}
                          alt={`${selectedProperty.marketingTitle || selectedProperty.village} — photo ${index + 1}`}
                          className="w-100 rounded-4 border"
                          style={{
                            height: '300px',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <Link to="/contactUs" className="btn btn-primary">
                    Ask About This Unit
                  </Link>

                  <button
                    className="btn btn-outline-dark"
                    onClick={() => setSelectedProperty(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default Marketing
