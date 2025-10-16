import { Router } from 'express';
import { z } from 'zod';
import {
  listFiliales,
  getFilial,
  createFilial,
  updateFilial,
  deactivateFilial,
  renewAuthorities,
  getStatistics,
} from '../controllers/filiales.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

const listSchema = z.object({
  query: z.object({
    esActiva: z.string().optional(),
    provinciaId: z.string().optional(),
    grupoId: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    orderBy: z.enum(['nombre', 'fechaFundacion']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});

const createSchema = z.object({
  body: z.object({
    nombre: z.string(),
    paisId: z.number(),
    provinciaId: z.number(),
    localidadId: z.number(),
    nombreLocalidad: z.string(),
    direccionSede: z.string().nullish(),
    coordenadas: z.string().nullish(),
    kmDesdeEstadio: z.number().int().nullish(),
    esActiva: z.boolean().optional(),
    esHabilitada: z.boolean().optional(),
    situacion: z.string().nullish(),
    grupoId: z.number().nullish(),
    fechaFundacion: z.string().datetime().nullish(),
    renovacionAutoridades: z.string().datetime().nullish(),
    esRenovada: z.boolean().optional(),
    periodoRenovacion: z.boolean().optional(),
    telefono: z.string().nullish(),
    mailInstitucional: z.string().email().nullish(),
    mailAlternativo: z.string().email().nullish(),
    actaConstitutiva: z.string().nullish(),
    escudo: z.string().nullish(),
    planillaIntegrantes: z.string().nullish(),
  }),
});

const updateSchema = createSchema.merge(idParamSchema);

const renewSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    renovacionAutoridades: z.string().datetime(),
    esRenovada: z.boolean(),
  }),
});

router.get('/', authenticate, validate(listSchema), listFiliales);
router.get('/:id', authenticate, validate(idParamSchema), getFilial);
router.post('/', authenticate, authorizeRoles('ADMIN'), validate(createSchema), createFilial);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'COORDINADOR'), validate(updateSchema), updateFilial);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), validate(idParamSchema), deactivateFilial);
router.put('/:id/renovar', authenticate, authorizeRoles('ADMIN', 'COORDINADOR'), validate(renewSchema), renewAuthorities);
router.get('/:id/estadisticas', authenticate, validate(idParamSchema), getStatistics);

export default router;
