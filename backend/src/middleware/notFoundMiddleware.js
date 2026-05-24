/**
 * Not Found Middleware
 * Catches any unmatched routes and passes a 404 error to the error handler.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
