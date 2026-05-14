import express from 'express';
import { authController } from '../controllers/auth';
import { validate, loginSchema, registerSchema } from '../middleware/validate';
import { authLimiter } from '../middleware/rate-limiter';

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/register', authLimiter, validate(registerSchema), authController.register);

export default router; 