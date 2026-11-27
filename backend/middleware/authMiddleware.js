const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Not authorized. Please log in."));
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ems_secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      return next(new Error("User not found."));
    }
    next();
  } catch {
    res.status(401);
    next(new Error("Invalid token. Please log in again."));
  }
};

module.exports = { protect };
