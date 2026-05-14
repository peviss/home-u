import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { Property } from '../types/property'
import { formatPrice } from '../lib/format'
import { propertyImageUrl } from '../lib/propertyImage'
import { PropertyFeatureChips } from './PropertyFeatureChips'

type PropertyCardProps = {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const img = propertyImageUrl(property.id)
  const available = property.isAvailable !== false

  return (
    <article className="property-card">
      <Link to={`/properties/${property.id}`} className="property-card__link">
        <div className="property-card__media">
          <img src={img} alt="" loading="lazy" />
          {!available && <span className="property-card__badge">Off market</span>}
        </div>
        <div className="property-card__body">
          <p className="property-card__price">{formatPrice(property.price)}</p>
          <h3 className="property-card__title">{property.title}</h3>
          <PropertyFeatureChips
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            area={property.area}
            className="property-card__features"
          />
          <p className="property-card__location">
            <MapPin className="property-card__location-icon" size={15} strokeWidth={2} aria-hidden />
            {property.city}, {property.state}
          </p>
        </div>
      </Link>
    </article>
  )
}
