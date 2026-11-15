const { errorResponse } = require('../utils/apiResponse');

/**
 * Validates request data against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return errorResponse(res, {
          statusCode: 400,
          message: 'Validation failed for request ' + source,
          errors: formattedErrors,
        });
      }
      next(err);
    }
  };
};

module.exports = { validate };
