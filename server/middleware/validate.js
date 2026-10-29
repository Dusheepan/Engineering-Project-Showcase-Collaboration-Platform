const { validationResult } = require('express-validator');

/**
 * Extracts and formats express-validator errors into a unified { field, message } array.
 * @param {Object} req - Express request object
 * @returns {Array<{field: string, message: string}>|null} Array of formatted error objects or null
 */
const getValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
  }
  return null;
};

/**
 * Express middleware that validates the incoming request against express-validator rules.
 * If validation errors exist, halts execution and returns a 400 Bad Request response with errors array.
 */
const validate = (req, res, next) => {
  const errors = getValidationErrors(req);
  if (errors) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }
  next();
};

module.exports = {
  getValidationErrors,
  validate,
};
