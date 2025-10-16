export const successResponse = (res, data, message = 'Operación exitosa', status = 200) => {
  return res.status(status).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (res, error, status = 500) => {
  return res.status(status).json({
    status: 'error',
    message: error instanceof Error ? error.message : error,
  });
};
