const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET || "ems_fallback_secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

/** Create a signed JWT token for a user */
const signToken = (userId) =>
  jwt.sign({ id: userId }, SECRET, { expiresIn: EXPIRES });

/** Format a safe user response object (no password / otp) */
const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  authProvider: user.authProvider,
  avatar: user.avatar || "",
  isVerified: user.isVerified,
});

// ─── OTP Helper ─────────────────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ─── REGISTER with Email/Password ───────────────────────────────────────────
const registerEmail = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      res.status(400);
      throw new Error("Full name, email, and password are required.");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters.");
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409);
      throw new Error("An account with this email already exists.");
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      authProvider: "email",
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to EMS.",
      token: signToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN with Email/Password ───────────────────────────────────────────────
const loginEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Incorrect email or password.");
    }

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token: signToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GOOGLE OAuth (Credential JWT or Built-in Google Account Picker) ──────────
const loginGoogle = async (req, res, next) => {
  try {
    const { credential, email: bodyEmail, fullName: bodyName } = req.body;

    let googleId;
    let email;
    let name;
    let picture = "";

    if (credential) {
      // Decode the Google ID token payload (base64 middle part)
      let googlePayload;
      try {
        googlePayload = JSON.parse(
          Buffer.from(credential.split(".")[1], "base64url").toString("utf-8")
        );
      } catch {
        res.status(400);
        throw new Error("Invalid Google credential token.");
      }

      googleId = googlePayload.sub;
      email = googlePayload.email;
      name = googlePayload.name;
      picture = googlePayload.picture || "";
    } else if (bodyEmail?.trim()) {
      email = bodyEmail.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400);
        throw new Error("Please enter a valid email address.");
      }
      name = bodyName?.trim() || email.split("@")[0];
      googleId = `google_${email}`;
    } else {
      res.status(400);
      throw new Error("Google account email is required.");
    }

    if (!email) {
      res.status(400);
      throw new Error("Could not extract email from Google account.");
    }

    // Upsert: find by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.isVerified = true;
      if (name && (!user.fullName || user.fullName === "Google User")) {
        user.fullName = name;
      }
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    } else {
      user = await User.create({
        fullName: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        authProvider: "google",
        avatar: picture,
        isVerified: true,
        role: "user",
      });
    }

    res.status(200).json({
      success: true,
      message: `Welcome, ${user.fullName}!`,
      token: signToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── SEND OTP to Phone ───────────────────────────────────────────────────────
const sendPhoneOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone?.trim()) {
      res.status(400);
      throw new Error("Phone number is required.");
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Find or create a user record for this phone number
    let user = await User.findOne({ phone: cleanPhone });
    if (user) {
      user.otp = { code: otp, expiresAt };
      await user.save();
    } else {
      user = await User.create({
        fullName: "Phone User",
        phone: cleanPhone,
        authProvider: "phone",
        otp: { code: otp, expiresAt },
        isVerified: false,
      });
    }

    // In production: integrate an SMS gateway (Twilio, etc.) to send the OTP.
    // For this college project, we return the OTP in the response so you can test it.
    console.log(`[DEV OTP] Phone: ${cleanPhone} → OTP: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${cleanPhone}. (Dev mode: OTP shown below)`,
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// ─── VERIFY Phone OTP ────────────────────────────────────────────────────────
const verifyPhoneOTP = async (req, res, next) => {
  try {
    const { phone, otp, fullName } = req.body;
    if (!phone?.trim() || !otp?.trim()) {
      res.status(400);
      throw new Error("Phone number and OTP are required.");
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const user = await User.findOne({ phone: cleanPhone });

    if (!user || !user.otp?.code) {
      res.status(400);
      throw new Error("No OTP found for this phone number. Please request a new OTP.");
    }

    if (new Date() > user.otp.expiresAt) {
      res.status(400);
      throw new Error("OTP has expired. Please request a new one.");
    }

    if (user.otp.code !== otp.trim()) {
      res.status(401);
      throw new Error("Incorrect OTP. Please try again.");
    }

    // OTP verified — update user
    if (fullName?.trim() && user.fullName === "Phone User") {
      user.fullName = fullName.trim();
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Welcome, ${user.fullName}!`,
      token: signToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET Current User Profile ────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: safeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerEmail,
  loginEmail,
  loginGoogle,
  sendPhoneOTP,
  verifyPhoneOTP,
  getMe,
};
