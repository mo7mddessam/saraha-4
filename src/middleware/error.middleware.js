export const notFound = (req, _res, next) => {
  const err = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  err.status = 404;
  next(err);
};

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate value: " + Object.keys(err.keyValue || {}).join(", ");
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  }
  if (err.name === "MulterError") status = 400;

  res.status(status).json({ success: false, message });
};
