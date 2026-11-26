const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protects routes by verifying the JWT token from the Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized. Please log in."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ems_fallback_secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      return next(new Error("User not found. Token invalid."));
    }
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Token verification failed. Please log in again."));
  }
};

/**
 * Restricts access to admin-role users only.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  next(new Error("Access denied. Admins only."));
};

module.exports = { protect, adminOnly };
