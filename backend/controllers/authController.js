const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET || "ems_secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

const signToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: EXPIRES });

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email || null,
  role: user.role,
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password) {
      res.status(400); throw new Error("All fields are required.");
    }
    if (password.length < 6) {
      res.status(400); throw new Error("Password must be at least 6 characters.");
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) { res.status(409); throw new Error("Email already registered."); }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json({ success: true, token: signToken(user._id), user: safeUser(user) });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      res.status(400); throw new Error("Email and password are required.");
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401); throw new Error("Incorrect email or password.");
    }
    res.json({ success: true, token: signToken(user._id), user: safeUser(user) });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: safeUser(req.user) });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
