import { errorResponse } from '../utils/response.utils.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return errorResponse(res, message, status, err.code || 'INTERNAL_ERROR');
};
