import { Bath, Bed, Ruler } from 'lucide-react'

type PropertyFeatureChipsProps = {
  bedrooms: number
  bathrooms: number
  area: number
  className?: string
}

const chipIcon = { size: 16, strokeWidth: 2, className: 'property-feature-chip__icon', 'aria-hidden': true as const }

export function PropertyFeatureChips({ bedrooms, bathrooms, area, className }: PropertyFeatureChipsProps) {
  return (
    <div className={`property-feature-chips ${className ?? ''}`}>
      <span className="property-feature-chip" title="Bedrooms">
        <Bed {...chipIcon} />
        <span className="property-feature-chip__text">{bedrooms}</span>
      </span>
      <span className="property-feature-chip__sep" aria-hidden>
        ·
      </span>
      <span className="property-feature-chip" title="Bathrooms">
        <Bath {...chipIcon} />
        <span className="property-feature-chip__text">{bathrooms}</span>
      </span>
      <span className="property-feature-chip__sep" aria-hidden>
        ·
      </span>
      <span className="property-feature-chip" title="Interior size">
        <Ruler {...chipIcon} />
        <span className="property-feature-chip__text">{new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(area)} sq ft</span>
      </span>
    </div>
  )
}
