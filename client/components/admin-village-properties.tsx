import { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL, apiFetch } from '../security/api'
import Navbar from './navbar'
import MarketingContentEditor from './marketing-content-editor'
import FaqManager from './faq-manager'

type Village = 'All' | 'Ngatea' | 'Whitianga'
type Tab = 'units' | 'brochure' | 'faq'

type VillageProperty = {
  id: number
  village: string
  unitNumber: string
  address: string
  isVisibleOnMarketing: boolean
  marketingTitle: string
  marketingDescription: string
  documentUrl1: string
  documentUrl2: string
}

type BrochureEntry = {
  id: number
  village: string
  kind: string
  title: string
  address: string
  description: string
  isPublished: boolean
}

type UnitRow = {
  key: string
  id: number
  source: 'property' | 'brochure'
  village: string
  unit: string
  address: string
  published: boolean
  ready: boolean
}

export default function AdminVillageProperties() {
  const [activeTab, setActiveTab] = useState<Tab>('units')
  const [selectedVillage, setSelectedVillage] = useState<Village>('All')
  const [search, setSearch] = useState('')
  const [properties, setProperties] = useState<VillageProperty[]>([])
  const [brochure, setBrochure] = useState<BrochureEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Read both database sources: operational property records and brochure adverts.
  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const urls = [
        `${API_BASE_URL}/api/village-properties/admin/all`,
        `${API_BASE_URL}/api/marketing-content/manage/Ngatea`,
        `${API_BASE_URL}/api/marketing-content/manage/Whitianga`,
      ]
      const responses = await Promise.all(urls.map((url) => apiFetch(url)))
      for (const response of responses) {
        if (!response.ok)
          throw new Error(
            `Could not load village data (HTTP ${response.status}).`,
          )
      }
      const [propertyData, ngateaData, whitiangaData]: unknown[] =
        await Promise.all(responses.map((response) => response.json()))
      if (
        !Array.isArray(propertyData) ||
        !Array.isArray(ngateaData) ||
        !Array.isArray(whitiangaData)
      ) {
        throw new Error('The API returned an unexpected format.')
      }
      setProperties(propertyData as VillageProperty[])
      setBrochure([...ngateaData, ...whitiangaData] as BrochureEntry[])
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Could not load village data.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const allUnits = useMemo<UnitRow[]>(() => {
    const operational = properties.map((property) => ({
      key: `property-${property.id}`,
      id: property.id,
      source: 'property' as const,
      village: property.village,
      unit: property.marketingTitle || `Unit ${property.unitNumber}`,
      address: property.address,
      published: property.isVisibleOnMarketing,
      // Only publish operational property records after public-only copy is prepared.
      ready: Boolean(
        property.marketingTitle?.trim() &&
        property.marketingDescription?.trim(),
      ),
    }))
    const brochureUnits = brochure
      .filter((item) => item.kind === 'unit')
      .map((item) => ({
        key: `brochure-${item.id}`,
        id: item.id,
        source: 'brochure' as const,
        village: item.village,
        unit: item.title,
        address: item.address,
        published: item.isPublished,
        ready: Boolean(item.title?.trim() && item.description?.trim()),
      }))
    return [...operational, ...brochureUnits].sort(
      (first, second) =>
        first.village.localeCompare(second.village) ||
        first.unit.localeCompare(second.unit),
    )
  }, [properties, brochure])

  const filteredUnits = useMemo(() => {
    const text = search.trim().toLowerCase()
    return allUnits.filter(
      (item) =>
        (selectedVillage === 'All' || item.village === selectedVillage) &&
        (!text ||
          `${item.unit} ${item.address} ${item.village}`
            .toLowerCase()
            .includes(text)),
    )
  }, [allUnits, search, selectedVillage])

  // Change only the publication flag; do not send or expose resident details.
  async function changePublication(unit: UnitRow, publish: boolean) {
    setSavingKey(unit.key)
    setError('')
    setMessage('')
    const url =
      unit.source === 'property'
        ? `${API_BASE_URL}/api/village-properties/${unit.id}/marketing-visibility`
        : `${API_BASE_URL}/api/marketing-content/${unit.id}/publication`
    const body =
      unit.source === 'property'
        ? { isVisibleOnMarketing: publish }
        : { isPublished: publish }
    try {
      const response = await apiFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const problem = (await response.json().catch(() => null)) as {
          message?: string
        } | null
        throw new Error(
          problem?.message ||
            `Could not update the listing (HTTP ${response.status}).`,
        )
      }
      if (unit.source === 'property') {
        setProperties((current) =>
          current.map((item) =>
            item.id === unit.id
              ? {
                  ...item,
                  isVisibleOnMarketing: publish,
                }
              : item,
          ),
        )
      } else {
        setBrochure((current) =>
          current.map((item) =>
            item.id === unit.id
              ? {
                  ...item,
                  isPublished: publish,
                }
              : item,
          ),
        )
      }
      setMessage(
        `${unit.unit} is now ${publish ? 'published' : 'hidden'} on Marketing.`,
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not change publication.',
      )
    } finally {
      setSavingKey(null)
    }
  }

  const marketingCount = allUnits.filter((unit) => unit.published).length
  const documentsCount = properties.reduce(
    (total, item) =>
      total +
      Number(Boolean(item.documentUrl1)) +
      Number(Boolean(item.documentUrl2)),
    0,
  )

  return (
    <>
      <Navbar userType="admin" />
      <main className="container py-5">
        <header className="samct-card border rounded-4 p-4 mb-4">
          <h1 className="h2 fw-bold">Village Data</h1>
          <p className="text-secondary mb-0">
            View property records and manage approved public content.
          </p>
        </header>

        {/* These are sections of Village Data, not duplicated profile pages. */}
        <div
          className="d-flex flex-wrap gap-2 mb-4"
          role="group"
          aria-label="Village data sections"
        >
          {(
            [
              ['units', 'Units & Properties'],
              ['brochure', 'Marketing & Brochure'],
              ['faq', 'Manage FAQs'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline-primary'}`}
              aria-pressed={activeTab === tab}
              onClick={() => {
                setActiveTab(tab)
                setError('')
                setMessage('')
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* The dropdown filters units and chooses the editing village. */}
        <div className="row g-3 align-items-end mb-4">
          <div className="col-sm-5 col-lg-3">
            <label htmlFor="village-filter" className="form-label">
              Village
            </label>
            <select
              id="village-filter"
              className="form-select"
              value={selectedVillage}
              onChange={(event) =>
                setSelectedVillage(event.target.value as Village)
              }
            >
              <option value="All">All villages</option>
              <option value="Ngatea">Ngatea</option>
              <option value="Whitianga">Whitianga</option>
            </select>
          </div>
          {activeTab === 'units' && (
            <div className="col-sm-7 col-lg-6">
              <label htmlFor="unit-search" className="form-label">
                Search units
              </label>
              <input
                id="unit-search"
                className="form-control"
                type="search"
                placeholder="Search unit name, number or address"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
          <div className="col-lg-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => void loadData()}
              disabled={loading}
            >
              Refresh data
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}
        {message && (
          <div role="status" className="alert alert-success">
            {message}
          </div>
        )}
        {loading && <p role="status">Loading village information…</p>}

        {activeTab === 'units' && !loading && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="samct-card p-3 border rounded-4">
                  <span className="text-secondary">
                    All units (both sources)
                  </span>
                  <div className="h3 mb-0">{allUnits.length}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="samct-card p-3 border rounded-4">
                  <span className="text-secondary">Marked for Marketing</span>
                  <div className="h3 mb-0">{marketingCount}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="samct-card p-3 border rounded-4">
                  <span className="text-secondary">
                    Private property documents
                  </span>
                  <div className="h3 mb-0">{documentsCount}</div>
                </div>
              </div>
            </div>
            <section className="samct-card p-4 border rounded-4">
              <h2 className="h4">Units & Properties</h2>
              <p className="small text-secondary">
                Operational units and individual-home brochure adverts appear
                here. Street areas and FAQs have separate sections. A checked
                box changes the public Marketing visibility.
              </p>
              {filteredUnits.length === 0 ? (
                <p className="alert alert-info mb-0">
                  No units match this village or search. Brochure street areas
                  are not individual units.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Village</th>
                        <th>Unit / Home</th>
                        <th>Address</th>
                        <th>Source</th>
                        <th>Show on Marketing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnits.map((unit) => (
                        <tr key={unit.key}>
                          <td>{unit.village}</td>
                          <td>
                            <strong>{unit.unit}</strong>
                          </td>
                          <td>{unit.address || '—'}</td>
                          <td>
                            {unit.source === 'property'
                              ? 'Village property'
                              : 'Brochure advert'}
                          </td>
                          <td>
                            <label className="d-inline-flex align-items-center gap-2">
                              <input
                                type="checkbox"
                                className="form-check-input m-0"
                                checked={unit.published}
                                disabled={
                                  savingKey !== null ||
                                  (!unit.ready && !unit.published)
                                }
                                onChange={(event) =>
                                  void changePublication(
                                    unit,
                                    event.target.checked,
                                  )
                                }
                                aria-label={`Show ${unit.unit} on Marketing`}
                              />
                              <span>
                                {savingKey === unit.key
                                  ? 'Saving…'
                                  : unit.published
                                    ? 'Published'
                                    : 'Hidden'}
                              </span>
                              {!unit.ready && !unit.published && (
                                <span className="text-muted small">
                                  Complete public title and description first
                                </span>
                              )}
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'brochure' &&
          (selectedVillage === 'All' ? (
            <p className="alert alert-info">
              Select Ngatea or Whitianga to edit its marketing content.
            </p>
          ) : (
            <MarketingContentEditor
              key={selectedVillage}
              village={selectedVillage}
              kinds={['unit', 'area', 'overview', 'steps', 'town', 'contact']}
            />
          ))}

        {activeTab === 'faq' &&
          (selectedVillage === 'All' ? (
            <p className="alert alert-info">
              Select Ngatea or Whitianga to manage its FAQs.
            </p>
          ) : (
            <FaqManager key={selectedVillage} village={selectedVillage} />
          ))}
      </main>
    </>
  )
}
