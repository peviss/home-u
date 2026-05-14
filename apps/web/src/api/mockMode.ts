import type { Property } from '../types/property'
import { MOCK_PROPERTIES } from '../data/mockProperties'

/**
 * Mock data is used when running the Vite dev server (`npm run dev`), so the UI
 * works without the API. Set `VITE_USE_MOCK=false` to hit the real backend in dev,
 * or `VITE_USE_MOCK=true` to force mocks in preview/production builds.
 */
export function shouldUseMockData(): boolean {
  const flag = import.meta.env.VITE_USE_MOCK
  if (flag === 'false' || flag === '0') return false
  if (flag === 'true' || flag === '1') return true
  return import.meta.env.DEV
}

export function getMockProperties(): Property[] {
  return MOCK_PROPERTIES.map((p) => ({ ...p }))
}

export function getMockPropertyById(id: number): Property | undefined {
  const row = MOCK_PROPERTIES.find((p) => p.id === id)
  return row ? { ...row } : undefined
}
