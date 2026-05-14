const IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=85',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=85',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=85',
]

/** Ordered gallery for a listing (rotated by id so each home feels distinct). */
export function propertyGalleryUrls(id: number): string[] {
  const start = Math.abs(id) % IMAGES.length
  return [...IMAGES.slice(start), ...IMAGES.slice(0, start)]
}

export function propertyImageUrl(id: number): string {
  return propertyGalleryUrls(id)[0]
}
