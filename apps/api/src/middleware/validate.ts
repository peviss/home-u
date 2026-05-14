import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error-handler';

declare global {
  namespace Express {
    interface Request {
      /** Set by `validateQuery` after successful parse */
      validatedQuery?: unknown;
    }
  }
}

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => e.message).join('; ');
        return next(new AppError(400, message || 'Validation failed'));
      }
      return next(error);
    }
  };
};

function flattenQuery(req: Request): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (Array.isArray(value)) {
      flat[key] = typeof value[0] === 'string' ? value[0] : undefined;
    } else if (typeof value === 'string') {
      flat[key] = value;
    }
  }
  return flat;
}

export const validateQuery =
  <T extends z.ZodTypeAny>(schema: T) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedQuery = await schema.parseAsync(flattenQuery(req));
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => e.message).join('; ');
        return next(new AppError(400, message || 'Invalid query parameters'));
      }
      return next(error);
    }
  };

const emptyToUndefined = (val: unknown) =>
  val === '' || val === undefined || val === null ? undefined : val;

export const propertyListQuerySchema = z
  .object({
    q: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(200).optional()),
    city: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
    state: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .length(2)
        .transform((s) => s.toUpperCase())
        .optional()
    ),
    zipCode: z.preprocess(emptyToUndefined, z.string().trim().min(3).max(10).optional()),
    minPrice: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    maxPrice: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    minBedrooms: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
    maxBedrooms: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
    minBathrooms: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
    maxBathrooms: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
    minArea: z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
    maxArea: z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
    isAvailable: z
      .preprocess(emptyToUndefined, z.enum(['true', 'false']).optional())
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    ownerId: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    page: z.preprocess((v) => (v === '' || v === undefined || v === null ? 1 : v), z.coerce.number().int().positive().default(1)),
    pageSize: z.preprocess(
      (v) => (v === '' || v === undefined || v === null ? 20 : v),
      z.coerce.number().int().positive().max(100).default(20)
    ),
    sort: z.preprocess(
      emptyToUndefined,
      z.enum(['createdAt', 'price', 'area', 'title', 'id']).default('createdAt')
    ),
    order: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).default('desc')),
  })
  .refine((d) => d.minPrice === undefined || d.maxPrice === undefined || d.minPrice <= d.maxPrice, {
    message: 'minPrice must be less than or equal to maxPrice',
    path: ['maxPrice'],
  })
  .refine((d) => d.minBedrooms === undefined || d.maxBedrooms === undefined || d.minBedrooms <= d.maxBedrooms, {
    message: 'minBedrooms must be less than or equal to maxBedrooms',
    path: ['maxBedrooms'],
  })
  .refine((d) => d.minBathrooms === undefined || d.maxBathrooms === undefined || d.minBathrooms <= d.maxBathrooms, {
    message: 'minBathrooms must be less than or equal to maxBathrooms',
    path: ['maxBathrooms'],
  })
  .refine((d) => d.minArea === undefined || d.maxArea === undefined || d.minArea <= d.maxArea, {
    message: 'minArea must be less than or equal to maxArea',
    path: ['maxArea'],
  });

export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;

// Property validation schemas
export const propertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive(),
  area: z.number().positive(),
  address: z.string(),
  city: z.string(),
  state: z.string().min(2).max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  isAvailable: z.boolean().optional(),
  ownerId: z.number().optional()
});

export const updatePropertySchema = propertySchema.partial(); 


export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2)
});