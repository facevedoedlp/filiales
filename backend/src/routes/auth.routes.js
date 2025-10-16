import { Router } from 'express';
import { z } from 'zod';
import { login, refresh, logout, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    correo: z.string().email(),
    password: z.string().min(6),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    token: z.object({
      userId: z.number(),
      rol: z.string(),
      filialId: z.number().nullable().optional(),
    }),
  }),
});

router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
