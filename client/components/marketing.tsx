import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { Link } from 'react-router-dom'
import AOS from 'aos'

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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";

  const [properties, setProperties] = useState<MarketingProperty[]>([])
  const [selectedVillage, setSelectedVillage] = useState('All')
  const [selectedProperty, setSelectedProperty] =
    useState<MarketingProperty | null>(null)

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-cubic',
    })

    loadMarketingProperties()
  }, [])

  const loadMarketingProperties = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/village-properties/marketing`,
    )
    const data = await response.json()

    if (response.ok) {
      setProperties(Array.isArray(data) ? data : [])
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
      <Navbar userType="public" />

      <main className="container py-5">
        <section
          className="samct-card p-5 text-center mb-4 shadow-sm border rounded-4 bg-white"
          data-aos="fade-down"
        >
          <p className="text-uppercase text-primary fw-semibold mb-2">
            SAMCT Villages
          </p>

          <h3 className="fw-bold mb-3">
            Safe, supportive village living in South Auckland and beyond
          </h3>

          <p
            className="text-secondary  mb-4 mx-auto"
            style={{ maxWidth: '850px' }}
          >
            Explore available village units, photos, and information for
            Ngatea, and Whitianga.
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
          {filteredProperties.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info text-center">
                No marketing listings available yet.
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
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold">
                      {selectedProperty.marketingTitle ||
                        `Unit ${selectedProperty.unitNumber}`}
                    </h5>
                    <p className="text-secondary mb-0">
                      {selectedProperty.village} | {selectedProperty.address}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedProperty(null)}
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
                          alt={`Gallery ${index + 1}`}
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
