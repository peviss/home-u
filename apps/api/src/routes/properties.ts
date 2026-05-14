import express from 'express';
import { propertyController } from '../controllers/property';
import {
  validate,
  validateQuery,
  propertySchema,
  updatePropertySchema,
  propertyListQuerySchema,
} from '../middleware/validate';
import { auth, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', validateQuery(propertyListQuerySchema), propertyController.listProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', auth, requireRole(['admin', 'agent']), validate(propertySchema), propertyController.createProperty);
router.put('/:id', auth, requireRole(['admin', 'agent']), validate(updatePropertySchema), propertyController.updateProperty);
router.patch('/:id', auth, requireRole(['admin', 'agent']), validate(updatePropertySchema), propertyController.updateProperty);
router.delete('/:id', auth, requireRole(['admin']), propertyController.deleteProperty);

export default router;