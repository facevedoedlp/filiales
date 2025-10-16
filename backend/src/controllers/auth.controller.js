import { successResponse } from '../utils/response.utils.js';
import * as authService from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const result = await authService.login(body);
    return successResponse(res, result, 'Inicio de sesión exitoso');
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const result = await authService.refresh(body);
    return successResponse(res, result, 'Token renovado');
  } catch (error) {
    return next(error);
  }
};

export const logout = async (_req, res) => {
  return successResponse(res, { ok: true }, 'Sesión cerrada');
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    return successResponse(res, user, 'Usuario autenticado');
  } catch (error) {
    return next(error);
  }
};
