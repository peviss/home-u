type HeroSearchProps = {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
}

export function HeroSearch({ query, onQueryChange, onSubmit }: HeroSearchProps) {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden />
      <div className="hero__content">
        <p className="hero__eyebrow">Find your next place</p>
        <h1 className="hero__title">Homes worth staying in</h1>
        <p className="hero__subtitle">
          Search by city or neighborhood, then refine with beds, baths, and budget.
        </p>
        <form
          className="hero-search"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <label className="sr-only" htmlFor="hero-search-input">
            Search location
          </label>
          <input
            id="hero-search-input"
            type="search"
            className="hero-search__input"
            placeholder="City, ZIP, or keyword…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="hero-search__btn">
            Search
          </button>
        </form>
      </div>
    </section>
  )
}
