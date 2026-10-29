/**
 * Global Error Handling Middleware
 * Ensures the server never crashes on bad input, invalid ObjectIds, or unhandled exceptions
 * Returns unified JSON error format: { success: false, errors: [...] }
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging during development
  console.error(`❌ [Error Handler] ${err.name || 'Error'}: ${err.message}`);

  // 1. Mongoose CastError (e.g. invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      errors: [
        {
          field: err.path,
          message: `Invalid ID format: '${err.value}' is not a valid ObjectId`,
        },
      ],
    });
  }

  // 2. Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return res.status(409).json({
      success: false,
      errors: [
        {
          field,
          message: `A record with ${field} '${value}' already exists`,
        },
      ],
    });
  }

  // 3. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.keys(err.errors || {}).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }

  // 4. Malformed JSON Body (SyntaxError from express.json parser)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      errors: [
        {
          message: 'Malformed JSON in request body. Please verify JSON syntax.',
        },
      ],
    });
  }

  // 5. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      errors: [{ message: 'Invalid authentication token' }],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      errors: [{ message: 'Authentication token has expired' }],
    });
  }

  // 6. Generic or Custom Status Code
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    errors: [
      {
        message: err.message || 'Internal server error',
      },
    ],
  });
};

module.exports = errorHandler;
