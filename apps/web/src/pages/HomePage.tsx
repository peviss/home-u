import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchProperties } from '../api/properties'
import { shouldUseMockData } from '../api/mockMode'
import type { Property } from '../types/property'
import { HeroSearch } from '../components/HeroSearch'
import { PropertyFilters, type FilterState } from '../components/PropertyFilters'
import { PropertyCard } from '../components/PropertyCard'

const defaultFilters: FilterState = {
  minPrice: '',
  maxPrice: '',
  minBeds: '',
  minBaths: '',
  onlyAvailable: false,
}

function matchesHeroQuery(p: Property, q: string): boolean {
  if (!q.trim()) return true
  const s = q.trim().toLowerCase()
  const hay = [
    p.title,
    p.description,
    p.city,
    p.state,
    p.zipCode,
    p.address,
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(s)
}

function matchesFilters(p: Property, filters: FilterState, city: string): boolean {
  if (city && p.city !== city) return false

  const minP = filters.minPrice ? Number(filters.minPrice) : null
  const maxP = filters.maxPrice ? Number(filters.maxPrice) : null
  if (minP !== null && !Number.isNaN(minP) && p.price < minP) return false
  if (maxP !== null && !Number.isNaN(maxP) && p.price > maxP) return false

  const minBeds = filters.minBeds ? Number(filters.minBeds) : null
  if (minBeds !== null && !Number.isNaN(minBeds) && p.bedrooms < minBeds) return false

  const minBaths = filters.minBaths ? Number(filters.minBaths) : null
  if (minBaths !== null && !Number.isNaN(minBaths) && p.bathrooms < minBaths) return false

  if (filters.onlyAvailable && p.isAvailable === false) return false

  return true
}

export function HomePage() {
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heroQuery, setHeroQuery] = useState('')
  const [appliedHeroQuery, setAppliedHeroQuery] = useState('')
  const [city, setCity] = useState('')
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProperties()
      setItems(data)
    } catch {
      setError(
        shouldUseMockData()
          ? 'Something went wrong loading sample listings.'
          : 'We could not load listings. Is the API running on port 3000?',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const cities = useMemo(() => {
    const set = new Set(items.map((p) => p.city))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [items])

  const filtered = useMemo(() => {
    return items
      .filter((p) => matchesHeroQuery(p, appliedHeroQuery))
      .filter((p) => matchesFilters(p, filters, city))
      .slice()
      .sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0
        if (tb !== ta && !Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta
        return b.id - a.id
      })
  }, [items, appliedHeroQuery, filters, city])

  const scrollToListings = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <HeroSearch
        query={heroQuery}
        onQueryChange={setHeroQuery}
        onSubmit={() => {
          setAppliedHeroQuery(heroQuery)
          scrollToListings()
        }}
      />

      <div className="page-section">
        <PropertyFilters
          filters={filters}
          onChange={setFilters}
          cities={cities}
          city={city}
          onCityChange={setCity}
        />

        <div className="page-section__intro" id="listings">
          <h2 className="page-section__title">Featured properties</h2>
          <p className="page-section__lede">
            Curated from your search and filters — {filtered.length}{' '}
            {filtered.length === 1 ? 'home' : 'homes'} match.
          </p>
        </div>

        {loading && <p className="state-message">Loading listings…</p>}
        {error && (
          <div className="state-message state-message--error">
            <p>{error}</p>
            <button type="button" className="btn-secondary" onClick={() => void load()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="state-message">No properties match. Try widening your search.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="property-grid">
            {filtered.map((p) => (
              <li key={p.id}>
                <PropertyCard property={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
