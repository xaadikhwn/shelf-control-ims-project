const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  const errorResponse = {
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
    details: err.details || [],
  };

  // If it's a Zod error, format it
  if (err.name === 'ZodError') {
    statusCode = 400;
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.message = 'Validation failed';
    errorResponse.details = err.errors;
  }

  // If it's a Sequelize error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    errorResponse.code = 'DB_VALIDATION_ERROR';
    errorResponse.message = 'Database validation failed';
    errorResponse.details = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
};

module.exports = { errorHandler };
