export const successResponse = (
  res,
  data,
  message = 'Operación exitosa',
  status = 200,
) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (res, error, status = 500, code = 'ERROR') => {
  const message = error instanceof Error ? error.message : error;
  const resolvedCode =
    error && typeof error === 'object' && error.code ? error.code : code;

  return res.status(status).json({
    success: false,
    error: message,
    code: resolvedCode,
  });
};
