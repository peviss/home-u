import { RequestHandler } from 'express';
import { propertyService } from '../services/property';
import type { PropertyListQuery } from '../middleware/validate';

function parsePropertyId(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export class PropertyController {
  listProperties: RequestHandler = async (req, res) => {
    try {
      const query = req.validatedQuery as PropertyListQuery;
      const result = await propertyService.listProperties(query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  };
  getPropertyById: RequestHandler = async (_req, res) => {
    try {
      const id = parsePropertyId(_req.params.id);
      if (id === null) {
        res.status(400).json({ error: 'Invalid property id' });
        return;
      }
      const property = await propertyService.getPropertyById(id);
      res.json(property);
    } catch (error) {
      if (error instanceof Error && error.message === 'Property not found') {
        res.status(404).json({ error: 'Property not found' });
      } else {
        res.status(500).json({ error: 'Failed to fetch property' });
      }
    }
  };

  createProperty: RequestHandler = async (_req, res) => {
    try {
      const newProperty = await propertyService.createProperty(_req.body);
      res.status(201).json(newProperty);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create property' });
    }
  };

  updateProperty: RequestHandler = async (_req, res) => {
    try {
      const id = parsePropertyId(_req.params.id);
      if (id === null) {
        res.status(400).json({ error: 'Invalid property id' });
        return;
      }
      const updatedProperty = await propertyService.updateProperty(id, _req.body);
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof Error && error.message === 'Property not found') {
        res.status(404).json({ error: 'Property not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update property' });
    }
  };

  deleteProperty: RequestHandler = async (_req, res) => {
    try {
      const id = parsePropertyId(_req.params.id);
      if (id === null) {
        res.status(400).json({ error: 'Invalid property id' });
        return;
      }
      await propertyService.deleteProperty(id);
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Property not found') {
        res.status(404).json({ error: 'Property not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to delete property' });
    }
  };
}

export const propertyController = new PropertyController();
