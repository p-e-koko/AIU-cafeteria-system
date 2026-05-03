/**
 * backend/middleware/errorHandler.js
 *
 * Centralised Express error handler.
 *
 * Rules:
 *  - NEVER expose stack traces, SQLite codes, file paths, or variable names.
 *  - Every response uses the standard shape:
 *      { success: false, error: { code, message, hint } }
 *  - Unknown errors fall back to SERVER_ERROR.
 */

const ERROR_MAP = {
  DB_ERROR: {
    status: 503,
    message: 'Our database is temporarily unavailable. Please try again shortly.',
    hint:    'If this keeps happening, please contact the cafeteria admin.',
  },
  NOT_FOUND: {
    status: 404,
    message: "The page or resource you requested doesn't exist.",
    hint:    'Double-check the URL or navigate using the menu.',
  },
  VALIDATION_ERROR: {
    status: 400,
    message: 'Some information is missing or incorrect. Please check your input.',
    hint:    'Make sure all required fields are filled in correctly.',
  },
  UNAUTHORIZED: {
    status: 403,
    message: "You don't have permission to do that.",
    hint:    'Log in with an account that has the required role.',
  },
  CONFLICT: {
    status: 409,
    message: 'This action conflicts with an existing record.',
    hint:    'You may have already submitted this information.',
  },
  SERVER_ERROR: {
    status: 500,
    message: "Something went wrong on our end. We're looking into it.",
    hint:    'If this keeps happening, please contact the cafeteria admin.',
  },
};

// Sequelize / SQLite errors are detected by name and remapped to DB_ERROR
const SEQUELIZE_ERROR_NAMES = [
  'SequelizeConnectionError',
  'SequelizeDatabaseError',
  'SequelizeTimeoutError',
  'SequelizeValidationError',
  'SequelizeUniqueConstraintError',
];

const errorHandler = (err, _req, res, _next) => {
  // Remap Sequelize errors to DB_ERROR so the DB_ERROR bucket handles them
  let code = err.code;
  if (!code && err.name && SEQUELIZE_ERROR_NAMES.includes(err.name)) {
    code = 'DB_ERROR';
  }

  const mapped = ERROR_MAP[code] || ERROR_MAP.SERVER_ERROR;

  res.status(mapped.status).json({
    success: false,
    error: {
      code:    code || 'SERVER_ERROR',
      message: mapped.message,
      hint:    mapped.hint,
    },
  });
};

export default errorHandler;
