import { db } from '../config/database';
import { properties } from './schema';

const dummyProperties = [
  {
    title: "Modern Downtown Apartment",
    description: "Luxurious 2-bed apartment with city views",
    price: 500000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    isAvailable: true
  },
  {
    title: "Suburban Family Home",
    description: "Spacious 4-bed house with large backyard",
    price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    address: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    isAvailable: true
  },
  {
    title: "Beachfront Condo",
    description: "Beautiful 3-bed condo with ocean views",
    price: 900000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    address: "789 Beach Road",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    isAvailable: true
  },
  {
    title: "Mountain Retreat",
    description: "Cozy 2-bed cabin in the mountains",
    price: 400000,
    bedrooms: 2,
    bathrooms: 1,
    area: 1000,
    address: "321 Pine Lane",
    city: "Denver",
    state: "CO",
    zipCode: "80201",
    isAvailable: true
  },
  {
    title: "Historic Townhouse",
    description: "Charming 3-bed townhouse in historic district",
    price: 650000,
    bedrooms: 3,
    bathrooms: 3,
    area: 1600,
    address: "555 Maple Street",
    city: "Boston",
    state: "MA",
    zipCode: "02108",
    isAvailable: true
  }
];

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Clear existing data
    await db.delete(properties);
    
    // Insert dummy data
    await db.insert(properties).values(dummyProperties);
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed(); 