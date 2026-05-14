import type { Property } from '../types/property'
import { getMockProperties, getMockPropertyById, shouldUseMockData } from './mockMode'

const base = () => import.meta.env.VITE_API_URL ?? ''

export type PropertyListResponse = {
  items: Property[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function buildPropertyListQuery(options: {
  q: string
  city: string
  minPrice: string
  maxPrice: string
  minBeds: string
  minBaths: string
  onlyAvailable: boolean
}): string {
  const p = new URLSearchParams()
  p.set('page', '1')
  p.set('pageSize', '100')
  p.set('sort', 'createdAt')
  p.set('order', 'desc')
  const q = options.q.trim()
  if (q) p.set('q', q)
  if (options.city.trim()) p.set('city', options.city.trim())
  if (options.minPrice.trim()) p.set('minPrice', options.minPrice.trim())
  if (options.maxPrice.trim()) p.set('maxPrice', options.maxPrice.trim())
  if (options.minBeds.trim()) p.set('minBedrooms', options.minBeds.trim())
  if (options.minBaths.trim()) p.set('minBathrooms', options.minBaths.trim())
  if (options.onlyAvailable) p.set('isAvailable', 'true')
  return p.toString()
}

export async function fetchProperties(queryString?: string): Promise<PropertyListResponse> {
  if (shouldUseMockData()) {
    const items = getMockProperties()
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      totalPages: 1,
    }
  }
  const qs = queryString && queryString.length > 0 ? `?${queryString}` : ''
  const res = await fetch(`${base()}/api/properties${qs}`)
  if (!res.ok) {
    throw new Error('Could not load properties')
  }
  return res.json() as Promise<PropertyListResponse>
}

export async function fetchPropertyById(id: number): Promise<Property> {
  if (shouldUseMockData()) {
    const row = getMockPropertyById(id)
    if (!row) {
      throw new Error('not_found')
    }
    return row
  }
  const res = await fetch(`${base()}/api/properties/${id}`)
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error('Could not load property')
  }
  return res.json() as Promise<Property>
}
