module.exports = (err, req, res, next) => {
  console.error('[Error]', err.stack);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map(d => d.message).join(', ');
  }

  // Handle specific DB errors (Postgres)
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    message = 'El registro ya existe.';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
