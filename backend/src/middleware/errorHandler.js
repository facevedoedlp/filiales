// backend/src/middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de Prisma - registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Registro no encontrado',
      code: 'NOT_FOUND'
    });
  }

  // Error de Prisma - constraint único
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Ya existe un registro con esos datos',
      code: 'DUPLICATE_ENTRY',
      field: err.meta?.target
    });
  }

  // Error de Prisma - foreign key
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      error: 'Referencia inválida',
      code: 'INVALID_REFERENCE'
    });
  }

  // Error de validación (Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Error de Multer (upload de archivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Archivo muy grande',
        code: 'FILE_TOO_LARGE',
        maxSize: '5MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Error al subir archivo',
      code: 'UPLOAD_ERROR'
    });
  }

  // Error personalizado con status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message || 'Error en la solicitud',
      code: err.code || 'ERROR'
    });
  }

  // Error genérico
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

// Helper para crear errores personalizados
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores comunes predefinidos
export const errors = {
  notFound: (resource = 'Recurso') => 
    new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND'),
  
  unauthorized: (message = 'No autorizado') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Acceso denegado') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  badRequest: (message = 'Solicitud inválida') => 
    new AppError(message, 400, 'BAD_REQUEST'),
  
  conflict: (message = 'Conflicto con datos existentes') => 
    new AppError(message, 409, 'CONFLICT'),
  
  validationError: (message = 'Error de validación') => 
    new AppError(message, 400, 'VALIDATION_ERROR')
};