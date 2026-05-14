import type { Property } from '../types/property'
import { getMockProperties, getMockPropertyById, shouldUseMockData } from './mockMode'

const base = () => import.meta.env.VITE_API_URL ?? ''

export async function fetchProperties(): Promise<Property[]> {
  if (shouldUseMockData()) {
    return getMockProperties()
  }
  const res = await fetch(`${base}/api/properties`)
  if (!res.ok) {
    throw new Error('Could not load properties')
  }
  return res.json() as Promise<Property[]>
}

export async function fetchPropertyById(id: number): Promise<Property> {
  if (shouldUseMockData()) {
    const row = getMockPropertyById(id)
    if (!row) {
      throw new Error('not_found')
    }
    return row
  }
  const res = await fetch(`${base}/api/properties/${id}`)
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error('Could not load property')
  }
  return res.json() as Promise<Property>
}
