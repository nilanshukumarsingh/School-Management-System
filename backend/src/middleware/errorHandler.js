const { errorResponse } = require('../utils/apiResponse');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedFields = Object.keys(err.keyPattern || {});
    message = `Duplicate resource conflict. Record with unique property (${duplicatedFields.join(', ')}) already exists.`;
    errors = err.keyValue;
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found or invalid ID format for field '${err.path}'.`;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Request validation failed';
    errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }

  // Log unexpected internal errors in development / production
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[UNHANDLED ERROR]', err);
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors,
  });
};

// 404 Route Not Found Handler
const notFoundHandler = (req, res) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
