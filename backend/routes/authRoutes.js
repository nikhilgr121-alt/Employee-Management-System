const express = require("express");
const {
  registerEmail,
  loginEmail,
  loginGoogle,
  sendPhoneOTP,
  verifyPhoneOTP,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Email / Password
router.post("/register", registerEmail);
router.post("/login", loginEmail);

// Google OAuth
router.post("/google", loginGoogle);

// Phone OTP
router.post("/phone/send-otp", sendPhoneOTP);
router.post("/phone/verify-otp", verifyPhoneOTP);

// Protected: Get current user
router.get("/me", protect, getMe);

module.exports = router;
