export type FilterState = {
  minPrice: string
  maxPrice: string
  minBeds: string
  minBaths: string
  onlyAvailable: boolean
}

type PropertyFiltersProps = {
  filters: FilterState
  onChange: (next: FilterState) => void
  cities: string[]
  city: string
  onCityChange: (city: string) => void
}

export function PropertyFilters({
  filters,
  onChange,
  cities,
  city,
  onCityChange,
}: PropertyFiltersProps) {
  const patch = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial })

  return (
    <section className="filters-panel" aria-labelledby="filters-heading">
      <h2 id="filters-heading" className="filters-panel__title">
        Filters
      </h2>
      <div className="filters-grid">
        <label className="field">
          <span className="field__label">City</span>
          <select
            className="field__control"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Min price</span>
          <input
            className="field__control"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Any"
            value={filters.minPrice}
            onChange={(e) => patch({ minPrice: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">Max price</span>
          <input
            className="field__control"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => patch({ maxPrice: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">Bedrooms (min)</span>
          <select
            className="field__control"
            value={filters.minBeds}
            onChange={(e) => patch({ minBeds: e.target.value })}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}+
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Bathrooms (min)</span>
          <select
            className="field__control"
            value={filters.minBaths}
            onChange={(e) => patch({ minBaths: e.target.value })}
          >
            <option value="">Any</option>
            {['1', '1.5', '2', '2.5', '3', '4'].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>
        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => patch({ onlyAvailable: e.target.checked })}
          />
          <span className="field__label">Available only</span>
        </label>
      </div>
    </section>
  )
}
