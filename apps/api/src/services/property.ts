import { db } from '../config/database';
import { properties } from '../db/schema';
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { Property, CreatePropertyDto, UpdatePropertyDto } from '../models/property';
import type { PropertyListQuery } from '../middleware/validate';

function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class PropertyService {
  async listProperties(query: PropertyListQuery): Promise<PropertyListResult> {
    try {
      const conditions: SQL[] = [];

      if (query.q) {
        const term = `%${escapeIlikePattern(query.q)}%`;
        conditions.push(
          or(
            ilike(properties.title, term),
            ilike(properties.description, term),
            ilike(properties.city, term),
            ilike(properties.address, term)
          ) as SQL
        );
      }
      if (query.city) {
        conditions.push(ilike(properties.city, `%${escapeIlikePattern(query.city)}%`));
      }
      if (query.state) {
        conditions.push(eq(properties.state, query.state));
      }
      if (query.zipCode) {
        conditions.push(eq(properties.zipCode, query.zipCode.trim()));
      }
      if (query.minPrice !== undefined) {
        conditions.push(gte(properties.price, query.minPrice));
      }
      if (query.maxPrice !== undefined) {
        conditions.push(lte(properties.price, query.maxPrice));
      }
      if (query.minBedrooms !== undefined) {
        conditions.push(gte(properties.bedrooms, query.minBedrooms));
      }
      if (query.maxBedrooms !== undefined) {
        conditions.push(lte(properties.bedrooms, query.maxBedrooms));
      }
      if (query.minBathrooms !== undefined) {
        conditions.push(gte(properties.bathrooms, query.minBathrooms));
      }
      if (query.maxBathrooms !== undefined) {
        conditions.push(lte(properties.bathrooms, query.maxBathrooms));
      }
      if (query.minArea !== undefined) {
        conditions.push(gte(properties.area, query.minArea));
      }
      if (query.maxArea !== undefined) {
        conditions.push(lte(properties.area, query.maxArea));
      }
      if (query.isAvailable !== undefined) {
        conditions.push(eq(properties.isAvailable, query.isAvailable));
      }
      if (query.ownerId !== undefined) {
        conditions.push(eq(properties.ownerId, query.ownerId));
      }

      const where = conditions.length ? and(...conditions) : undefined;
      const sortCol =
        query.sort === 'price'
          ? properties.price
          : query.sort === 'area'
            ? properties.area
            : query.sort === 'title'
              ? properties.title
              : query.sort === 'id'
                ? properties.id
                : properties.createdAt;
      const orderFn = query.order === 'asc' ? asc : desc;

      const offset = (query.page - 1) * query.pageSize;

      let countQuery = db.select({ count: sql<number>`cast(count(*) as int)` }).from(properties);
      if (where) countQuery = countQuery.where(where);
      const countRows = await countQuery;
      const total = countRows[0]?.count ?? 0;

      let listQuery = db.select().from(properties).orderBy(orderFn(sortCol)).limit(query.pageSize).offset(offset);
      if (where) listQuery = listQuery.where(where);
      const items = await listQuery;

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

      return {
        items,
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages,
      };
    } catch (error) {
      throw new Error('Database error while fetching properties');
    }
  }

  async getPropertyById(id: number): Promise<Property> {
    try {
      const property = await db
        .select()
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);

      if (!property.length) {
        throw new Error('Property not found');
      }

      return property[0];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Database error while fetching property');
    }
  }

  async createProperty(propertyData: CreatePropertyDto): Promise<Property> {
    try {
      const newProperty = await db
        .insert(properties)
        .values(propertyData)
        .returning();

      return newProperty[0];
    } catch (error) {
      throw new Error('Database error while creating property');
    }
  }

  async updateProperty(id: number, propertyData: UpdatePropertyDto): Promise<Property> {
    try {
      const updatedProperty = await db
        .update(properties)
        .set({
          ...propertyData,
          updatedAt: new Date()
        })
        .where(eq(properties.id, id))
        .returning();

      if (!updatedProperty.length) {
        throw new Error('Property not found');
      }

      return updatedProperty[0];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Database error while updating property');
    }
  }

  async deleteProperty(id: number): Promise<Property> {
    try {
      const deletedProperty = await db
        .delete(properties)
        .where(eq(properties.id, id))
        .returning();

      if (!deletedProperty.length) {
        throw new Error('Property not found');
      }

      return deletedProperty[0];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Database error while deleting property');
    }
  }
}

export const propertyService = new PropertyService();
