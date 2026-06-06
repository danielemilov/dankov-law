export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (process.env.NODE_ENV !== 'test') {
    console.error('API error:', err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Сървърна грешка.' : err.message,
  });
}
