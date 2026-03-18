function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err && err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      issues: err.issues,
    });
  }

  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = { errorHandler };
