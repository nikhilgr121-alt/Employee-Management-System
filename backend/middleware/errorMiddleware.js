/**
 * Handles requests to undefined routes (404 Not Found).
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Express error-handling middleware.
 * Normalizes Mongoose validation, duplicate key, and invalid ObjectId errors.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal Server Error";

  // Invalid MongoDB ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid employee record ID format";
  }

  // Mongoose schema validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((item) => item.message);
    message = messages.join(". ");
  }

  // MongoDB duplicate key error (e.g., duplicate employeeId)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
    if (duplicateField === "employeeId") {
      message = `Employee ID "${err.keyValue.employeeId}" already exists. Please use a unique Employee ID.`;
    } else {
      message = `Duplicate value for ${duplicateField}`;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
