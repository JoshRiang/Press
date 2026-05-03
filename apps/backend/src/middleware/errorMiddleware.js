export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const isDev = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    message,
  };

  if (isDev) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  const err = new Error(`Route Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};
