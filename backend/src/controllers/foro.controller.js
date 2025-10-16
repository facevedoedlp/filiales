import { successResponse } from '../utils/response.utils.js';

export const listTemas = async (_req, res) => {
  return successResponse(res, [], 'Listado de temas del foro (pendiente de implementación)');
};

export const getTema = async (_req, res) => {
  return successResponse(res, null, 'Detalle de tema (pendiente de implementación)');
};
