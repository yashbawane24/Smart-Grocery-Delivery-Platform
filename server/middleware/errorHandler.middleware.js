const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error = new ApiError(401, "Not authorized, token invalid or expired");
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    error = new ApiError(statusCode, error.message || "Internal server error");
  }

  // Postgres unique constraint violation
  if (err.code === "23505") {
    error = new ApiError(409, "A record with these details already exists");
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found — ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
