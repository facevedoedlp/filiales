import { errorResponse } from '../utils/response.utils.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    const data = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
      files: req.files,
    });

    req.validated = data;
    return next();
  } catch (error) {
    const issues = error.issues?.map((issue) => issue.message) ?? [error.message];
    return errorResponse(res, issues.join(', '), 400);
  }
};
