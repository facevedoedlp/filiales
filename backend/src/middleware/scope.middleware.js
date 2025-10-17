// backend/src/middleware/scope.middleware.js
import { errors } from './errorHandler.js';
import { toCamelCase } from '../utils/case.utils.js';

const parseFilialId = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw errors.badRequest('filial_id debe ser un número válido');
  }

  return parsed;
};

export const scopeFilial = (req, _res, next) => {
  try {
    if (!req.user) {
      return next(errors.unauthorized('No autenticado'));
    }

    const normalizedQuery = toCamelCase(req.query ?? {});
    req.query = normalizedQuery;

    const isGlobalAdmin = req.user.rol === 'ADMIN_GLOBAL';
    const userFilialId = req.user.filial_id ?? req.user.filialId ?? null;

    req.scope = {
      isGlobalAdmin,
      filialId: isGlobalAdmin ? null : userFilialId,
      resolveFilialId: (requested) => {
        if (isGlobalAdmin) {
          return parseFilialId(requested);
        }

        if (!userFilialId) {
          throw errors.forbidden('Usuario sin filial asignada');
        }

        return userFilialId;
      },
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
