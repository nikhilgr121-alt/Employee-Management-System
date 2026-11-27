const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server Error";

  if (err.name === "CastError") { status = 400; message = "Invalid ID format"; }
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(". ");
  }
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
