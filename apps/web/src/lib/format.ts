export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatArea(sqft: number): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(sqft)} sq ft`
}

export function formatPricePerSqFt(price: number, sqft: number): string | null {
  if (!sqft || sqft <= 0) return null
  const ppsf = Math.round(price / sqft)
  return `${formatPrice(ppsf)}/sq ft`
}

export function formatListingDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(t)
}
