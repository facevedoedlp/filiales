import { successResponse } from '../utils/response.utils.js';
import { listForUser } from '../services/notificaciones.service.js';

export const listNotificaciones = async (req, res, next) => {
  try {
    const result = await listForUser(req.user.id);
    return successResponse(res, result, 'Listado de notificaciones');
  } catch (error) {
    return next(error);
  }
};
