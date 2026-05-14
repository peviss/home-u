import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  CalendarClock,
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Hash,
  MapPin,
  Ruler,
  Tag,
} from 'lucide-react'
import { fetchPropertyById } from '../api/properties'
import type { Property } from '../types/property'
import { formatArea, formatListingDate, formatPrice, formatPricePerSqFt } from '../lib/format'
import { PropertyImageGallery } from '../components/PropertyImageGallery'
import { propertyGalleryUrls, propertyImageUrl } from '../lib/propertyImage'

type FactRow = { label: string; value: string; Icon?: LucideIcon }

function fullStreetAddress(p: Property): string {
  return `${p.address}, ${p.city}, ${p.state} ${p.zipCode}`
}

function mapsSearchUrl(p: Property): string {
  const q = encodeURIComponent(fullStreetAddress(p))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'not_found' | 'other' | null>(null)

  useEffect(() => {
    const raw = id ?? ''
    const num = Number(raw)
    if (!Number.isInteger(num) || num < 1) {
      setError('not_found')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPropertyById(num)
      .then((p) => {
        if (!cancelled) {
          setProperty(p)
          setError(null)
        }
      })
      .catch((e: Error) => {
        if (cancelled) return
        setProperty(null)
        setError(e.message === 'not_found' ? 'not_found' : 'other')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const facts = useMemo((): FactRow[] => {
    if (!property) return []
    const rows: FactRow[] = [
      { label: 'List price', value: formatPrice(property.price), Icon: CircleDollarSign },
    ]
    const ppsf = formatPricePerSqFt(property.price, property.area)
    if (ppsf) rows.push({ label: 'Price / sq ft', value: ppsf, Icon: Tag })
    rows.push(
      { label: 'Bedrooms', value: String(property.bedrooms), Icon: Bed },
      { label: 'Bathrooms', value: String(property.bathrooms), Icon: Bath },
      { label: 'Interior', value: formatArea(property.area), Icon: Ruler },
      { label: 'City', value: property.city, Icon: MapPin },
      { label: 'State', value: property.state, Icon: Building2 },
      { label: 'ZIP', value: property.zipCode, Icon: Hash },
    )
    return rows
  }, [property])

  const listingDetailRows = useMemo(() => {
    if (!property) return []
    const available = property.isAvailable !== false
    const listedStr = formatListingDate(property.createdAt)
    const updatedStr = formatListingDate(property.updatedAt)
    const rows: { label: string; value: string; Icon: LucideIcon }[] = [
      {
        label: 'Status',
        value: available ? 'Active listing' : 'Not currently available',
        Icon: available ? CircleCheck : CircleX,
      },
    ]
    if (listedStr) rows.push({ label: 'Listed', value: listedStr, Icon: Calendar })
    if (updatedStr) rows.push({ label: 'Last updated', value: updatedStr, Icon: CalendarClock })
    rows.push({ label: 'Reference', value: `#${property.id}`, Icon: Hash })
    return rows
  }, [property])

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)

  const galleryUrls = useMemo(() => (property ? propertyGalleryUrls(property.id) : []), [property])

  if (loading) {
    return (
      <div className="detail-page">
        <p className="state-message">Loading property…</p>
      </div>
    )
  }

  if (error === 'not_found' || !property) {
    return (
      <div className="detail-page detail-page--narrow">
        <p className="state-message">This listing was not found.</p>
        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
          Back to search
        </button>
      </div>
    )
  }

  if (error === 'other') {
    return (
      <div className="detail-page detail-page--narrow">
        <p className="state-message state-message--error">Something went wrong loading this home.</p>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  const img = propertyImageUrl(property.id)
  const available = property.isAvailable !== false

  return (
    <div className="detail-page">
      <Link to="/" className="detail-back">
        ← All listings
      </Link>

      <header className="detail-hero">
        <div className="detail-hero__media">
          <button
            type="button"
            className="detail-hero__gallery-open"
            onClick={() => {
              setGalleryStartIndex(0)
              setGalleryOpen(true)
            }}
            aria-label="Open photo gallery"
          >
            <img src={img} alt="" />
            <span className="detail-hero__gallery-open-label">View photos</span>
          </button>
          {!available && <span className="detail-hero__badge">Off market</span>}
        </div>
        <div className="detail-hero__summary">
          <div className="detail-meta-bar">
            <span className={`detail-status ${available ? 'detail-status--live' : 'detail-status--off'}`}>
              {available ? 'Available' : 'Off market'}
            </span>
            <span className="detail-meta-bar__sep" aria-hidden />
            <span className="detail-listing-id">Listing #{property.id}</span>
          </div>
          <p className="detail-price">{formatPrice(property.price)}</p>
          <h1 className="detail-title">{property.title}</h1>
          <p className="detail-address">{fullStreetAddress(property)}</p>
          <ul className="detail-stats">
            <li className="detail-stats__item">
              <Bed className="detail-stats__icon" size={22} strokeWidth={2} aria-hidden />
              <div className="detail-stats__text">
                <span className="detail-stats__value">{property.bedrooms}</span>
                <span className="detail-stats__label">Bedrooms</span>
              </div>
            </li>
            <li className="detail-stats__item">
              <Bath className="detail-stats__icon" size={22} strokeWidth={2} aria-hidden />
              <div className="detail-stats__text">
                <span className="detail-stats__value">{property.bathrooms}</span>
                <span className="detail-stats__label">Bathrooms</span>
              </div>
            </li>
            <li className="detail-stats__item">
              <Ruler className="detail-stats__icon" size={22} strokeWidth={2} aria-hidden />
              <div className="detail-stats__text">
                <span className="detail-stats__value">{formatArea(property.area)}</span>
                <span className="detail-stats__label">Living area</span>
              </div>
            </li>
          </ul>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-block">
            <h2 className="detail-section-title">About this home</h2>
            <p className="detail-description">{property.description}</p>
          </section>

          <section className="detail-block">
            <h2 className="detail-section-title">Facts &amp; figures</h2>
            <dl className="detail-facts">
              {facts.map((row) => {
                const Icon = row.Icon
                return (
                  <div key={row.label} className="detail-facts__row">
                    <dt>
                      <span className="detail-facts__label-cell">
                        {Icon ? <Icon className="detail-facts__icon" size={17} strokeWidth={2} aria-hidden /> : null}
                        <span>{row.label}</span>
                      </span>
                    </dt>
                    <dd>{row.value}</dd>
                  </div>
                )
              })}
            </dl>
          </section>

          <section className="detail-block">
            <h2 className="detail-section-title detail-section-title--inline">
              <MapPin className="detail-section-title__icon" size={20} strokeWidth={2} aria-hidden />
              Location
            </h2>
            <p className="detail-location-lede">
              Set on <strong>{property.address}</strong> in {property.city}, {property.state} — ZIP{' '}
              {property.zipCode}.
            </p>
            <a className="detail-map-link" href={mapsSearchUrl(property)} target="_blank" rel="noreferrer">
              View on Google Maps
              <span className="detail-map-link__arrow" aria-hidden>
                ↗
              </span>
            </a>
          </section>

          <section className="detail-block">
            <h2 className="detail-section-title">Listing details</h2>
            <dl className="detail-facts">
              {listingDetailRows.map((row) => {
                const Icon = row.Icon
                return (
                  <div key={row.label} className="detail-facts__row">
                    <dt>
                      <span className="detail-facts__label-cell">
                        <Icon className="detail-facts__icon" size={17} strokeWidth={2} aria-hidden />
                        <span>{row.label}</span>
                      </span>
                    </dt>
                    <dd>{row.value}</dd>
                  </div>
                )
              })}
            </dl>
          </section>
        </div>

        <aside className="detail-aside">
          <div className="detail-cta-card">
            <h3 className="detail-cta-card__title">Interested?</h3>
            <p className="detail-cta-card__text">
              Connect with an agent to schedule a tour or ask questions about this property.
            </p>
            <button type="button" className="btn-primary" disabled={!available}>
              {available ? 'Request a tour' : 'Unavailable'}
            </button>
            <p className="detail-cta-card__fineprint">
              Typical response within one business day. Tours subject to availability.
            </p>
          </div>
        </aside>
      </div>

      <PropertyImageGallery
        images={galleryUrls}
        title={property.title}
        isOpen={galleryOpen}
        initialIndex={galleryStartIndex}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  )
}
