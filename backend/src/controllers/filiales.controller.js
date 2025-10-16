import { successResponse } from '../utils/response.utils.js';
import * as filialesService from '../services/filiales.service.js';

export const listFiliales = async (req, res, next) => {
  try {
    const { query } = req.validated;
    const result = await filialesService.listFiliales(query);
    return successResponse(res, result, 'Listado de filiales');
  } catch (error) {
    return next(error);
  }
};

export const getFilial = async (req, res, next) => {
  try {
    const { params } = req.validated;
    const result = await filialesService.getFilial(Number(params.id));
    return successResponse(res, result, 'Detalle de filial');
  } catch (error) {
    return next(error);
  }
};

export const createFilial = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const result = await filialesService.createFilial(body);
    return successResponse(res, result, 'Filial creada', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateFilial = async (req, res, next) => {
  try {
    const { params, body } = req.validated;
    const result = await filialesService.updateFilial(Number(params.id), body);
    return successResponse(res, result, 'Filial actualizada');
  } catch (error) {
    return next(error);
  }
};

export const deactivateFilial = async (req, res, next) => {
  try {
    const { params } = req.validated;
    const result = await filialesService.deactivateFilial(Number(params.id));
    return successResponse(res, result, 'Filial desactivada');
  } catch (error) {
    return next(error);
  }
};

export const renewAuthorities = async (req, res, next) => {
  try {
    const { params, body } = req.validated;
    const result = await filialesService.renewAuthorities(Number(params.id), body);
    return successResponse(res, result, 'Autoridades renovadas');
  } catch (error) {
    return next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const { params } = req.validated;
    const result = await filialesService.getStatistics(Number(params.id));
    return successResponse(res, result, 'Estadísticas de la filial');
  } catch (error) {
    return next(error);
  }
};
