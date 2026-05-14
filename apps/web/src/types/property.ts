export interface Property {
  id: number
  title: string
  description: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  address: string
  city: string
  state: string
  zipCode: string
  isAvailable?: boolean | null
  ownerId?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}
