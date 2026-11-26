import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  sendOTP,
  verifyOTP,
} from "../services/authService";

/* ─── Google Client ID ──────────────────────────────────────────────────────
   Replace with your real Google OAuth Client ID from console.cloud.google.com
   For testing without a real Client ID, use the Email/Password or Phone tab.
   ──────────────────────────────────────────────────────────────────────────*/
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";

// Tab types
const TAB_LOGIN = "login";
const TAB_REGISTER = "register";
const TAB_PHONE = "phone";

export default function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState(TAB_LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [phoneName, setPhoneName] = useState("");
  const otpRefs = useRef([]);

  // Google Sign-In button container & built-in account chooser modal
  const googleBtnRef = useRef(null);
  const googleBtnRef2 = useRef(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const handleInstantGoogleLogin = async (name, emailAddr) => {
    clearMessages();
    if (!emailAddr?.trim()) {
      return setError("Please enter your Gmail address.");
    }
    setIsLoading(true);
    try {
      const data = await loginWithGoogle({
        fullName: name?.trim() || emailAddr.split("@")[0],
        email: emailAddr.trim(),
      });
      setShowGoogleModal(false);
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Identity Services ──────────────────────────────────────────────
  const handleGoogleCredential = async (credentialResponse) => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initGoogleSignIn = (containerRef) => {
    if (!window.google || !containerRef.current) return;
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE") return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      text: "continue_with",
      size: "large",
      width: containerRef.current.offsetWidth || 340,
      logo_alignment: "left",
    });
  };

  useEffect(() => {
    const script = document.getElementById("google-gsi");
    if (!script) {
      const s = document.createElement("script");
      s.id = "google-gsi";
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => {
        initGoogleSignIn(googleBtnRef);
        initGoogleSignIn(googleBtnRef2);
      };
      document.head.appendChild(s);
    } else if (window.google) {
      setTimeout(() => {
        initGoogleSignIn(googleBtnRef);
        initGoogleSignIn(googleBtnRef2);
      }, 100);
    }
  }, [tab]);

  // ─── Email/Password Login ──────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password) return setError("Email and password are required.");
    setIsLoading(true);
    try {
      const data = await loginWithEmail(email.trim(), password);
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm)
      return setError("All fields are required.");
    if (regPassword.length < 6)
      return setError("Password must be at least 6 characters.");
    if (regPassword !== regConfirm)
      return setError("Passwords do not match.");
    setIsLoading(true);
    try {
      const data = await registerWithEmail(regName.trim(), regEmail.trim(), regPassword);
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phone OTP ────────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!phone.trim()) return setError("Please enter your phone number.");
    setIsLoading(true);
    try {
      const data = await sendOTP(phone.trim());
      setOtpSent(true);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        setSuccessMsg(`OTP sent! (Dev mode — your OTP is: ${data.devOtp})`);
      } else {
        setSuccessMsg(`OTP sent to ${phone.trim()}.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    clearMessages();
    const otpString = otp.join("");
    if (otpString.length < 6) return setError("Please enter all 6 OTP digits.");
    setIsLoading(true);
    try {
      const data = await verifyOTP(phone.trim(), otpString, phoneName.trim() || undefined);
      login(data);
    } catch (err) {
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const googleNotConfigured = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22v-4h6v4" />
              <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
            </svg>
          </div>
          <div>
            <h1 className="auth-brand-name">EMS Admin</h1>
            <p className="auth-brand-tagline">Workforce Suite</p>
          </div>
        </div>

        <div className="auth-hero-text">
          <h2 className="auth-hero-title">Manage your workforce smarter</h2>
          <p className="auth-hero-sub">
            Centralized employee records, real-time analytics, and department
            insights — all powered by MongoDB Atlas.
          </p>
        </div>

        <div className="auth-features">
          {[
            { icon: "👥", label: "Employee Directory", desc: "Add, edit & delete records" },
            { icon: "📊", label: "Live Dashboard", desc: "Real-time workforce analytics" },
            { icon: "🔒", label: "Secure Login", desc: "Google, Phone & Email auth" },
          ].map((f) => (
            <div key={f.label} className="auth-feature-item">
              <span className="auth-feature-icon">{f.icon}</span>
              <div>
                <p className="auth-feature-label">{f.label}</p>
                <p className="auth-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${tab === TAB_LOGIN ? "auth-tab-active" : ""}`}
              onClick={() => { setTab(TAB_LOGIN); clearMessages(); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${tab === TAB_REGISTER ? "auth-tab-active" : ""}`}
              onClick={() => { setTab(TAB_REGISTER); clearMessages(); }}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`auth-tab ${tab === TAB_PHONE ? "auth-tab-active" : ""}`}
              onClick={() => { setTab(TAB_PHONE); clearMessages(); }}
            >
              📱 Phone
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <span>⚠</span> {error}
            </div>
          )}
          {successMsg && (
            <div className="auth-alert auth-alert-success">
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* ── LOGIN TAB ── */}
          {tab === TAB_LOGIN && (
            <div className="auth-form-section">
              <div className="auth-form-heading">
                <h2>Welcome back</h2>
                <p>Sign in to access the Employee Management System</p>
              </div>

              {/* Google Button */}
              <div className="auth-google-wrapper">
                {googleNotConfigured ? (
                  <button
                    type="button"
                    className="btn-google-fallback"
                    onClick={() => {
                      clearMessages();
                      setShowGoogleModal(true);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                ) : (
                  <div ref={googleBtnRef} className="google-gsi-container" />
                )}
              </div>

              <div className="auth-divider"><span>or sign in with email</span></div>

              <form onSubmit={handleEmailLogin} noValidate>
                <div className="auth-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? <span className="auth-spinner" /> : null}
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="auth-switch-text">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => { setTab(TAB_REGISTER); clearMessages(); }}
                >
                  Create Account
                </button>
              </p>
            </div>
          )}

          {/* ── REGISTER TAB ── */}
          {tab === TAB_REGISTER && (
            <div className="auth-form-section">
              <div className="auth-form-heading">
                <h2>Create your account</h2>
                <p>Join the Employee Management System</p>
              </div>

              {/* Google Sign-Up */}
              <div className="auth-google-wrapper">
                {googleNotConfigured ? (
                  <button
                    type="button"
                    className="btn-google-fallback"
                    onClick={() => {
                      clearMessages();
                      setShowGoogleModal(true);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                ) : (
                  <div ref={googleBtnRef2} className="google-gsi-container" />
                )}
              </div>

              <div className="auth-divider"><span>or create with email</span></div>

              <form onSubmit={handleRegister} noValidate>
                <div className="auth-field">
                  <label>Full Name <span className="required-star">*</span></label>
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                <div className="auth-field">
                  <label>Email Address <span className="required-star">*</span></label>
                  <input
                    type="email"
                    placeholder="aarav@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label>Password <span className="required-star">*</span></label>
                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="auth-field">
                    <label>Confirm Password <span className="required-star">*</span></label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {regPassword && (
                  <div className="auth-strength-bar">
                    <div
                      className={`auth-strength-fill ${
                        regPassword.length < 6
                          ? "strength-weak"
                          : regPassword.length < 10
                          ? "strength-medium"
                          : "strength-strong"
                      }`}
                      style={{
                        width:
                          regPassword.length < 6
                            ? "33%"
                            : regPassword.length < 10
                            ? "66%"
                            : "100%",
                      }}
                    />
                    <span>
                      {regPassword.length < 6
                        ? "Weak"
                        : regPassword.length < 10
                        ? "Fair"
                        : "Strong"}
                    </span>
                  </div>
                )}

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? <span className="auth-spinner" /> : null}
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <p className="auth-switch-text">
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => { setTab(TAB_LOGIN); clearMessages(); }}
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ── PHONE OTP TAB ── */}
          {tab === TAB_PHONE && (
            <div className="auth-form-section">
              {!otpSent ? (
                <>
                  <div className="auth-form-heading">
                    <div className="auth-phone-icon">📱</div>
                    <h2>Sign in with Phone</h2>
                    <p>We'll send a 6-digit OTP to your mobile number</p>
                  </div>
                  <form onSubmit={handleSendOTP} noValidate>
                    <div className="auth-field">
                      <label>Phone Number</label>
                      <div className="auth-phone-row">
                        <span className="auth-phone-prefix">🇮🇳 +91</span>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          disabled={isLoading}
                          autoComplete="tel"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={isLoading || phone.length < 10}>
                      {isLoading ? <span className="auth-spinner" /> : "📨"}
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="auth-form-heading">
                    <div className="auth-phone-icon">🔐</div>
                    <h2>Verify OTP</h2>
                    <p>
                      Enter the 6-digit code sent to <strong>+91 {phone}</strong>
                    </p>
                    {devOtp && (
                      <div className="auth-dev-otp-banner">
                        🧪 <strong>Dev Mode OTP:</strong>{" "}
                        <span
                          className="auth-otp-reveal"
                          onClick={() => {
                            const digits = devOtp.split("");
                            setOtp(digits);
                          }}
                          title="Click to auto-fill"
                        >
                          {devOtp}
                        </span>{" "}
                        <small>(click to auto-fill)</small>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleVerifyOTP} noValidate>
                    <div className="auth-field">
                      <label>Your Name (optional — for new accounts)</label>
                      <input
                        type="text"
                        placeholder="Aarav Sharma"
                        value={phoneName}
                        onChange={(e) => setPhoneName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="auth-otp-boxes">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="auth-otp-box"
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          disabled={isLoading}
                        />
                      ))}
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                      {isLoading ? <span className="auth-spinner" /> : "✓"}
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </button>

                    <button
                      type="button"
                      className="auth-resend-btn"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp(["", "", "", "", "", ""]);
                        setDevOtp("");
                        clearMessages();
                      }}
                    >
                      ← Change number / Resend OTP
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        <p className="auth-footer">
          © 2024 Employee Management System · College Project
        </p>
      </div>

      {/* Built-in Google Account Chooser Modal */}
      {showGoogleModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2 className="modal-title">Sign in with Google</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isLoading && setShowGoogleModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="google-modal-sub">
                Choose a quick account or enter your Google email to sign in or create an ID automatically:
              </p>

              <button
                type="button"
                className="google-account-option"
                disabled={isLoading}
                onClick={() =>
                  handleInstantGoogleLogin("EMS Admin", "admin.ems@gmail.com")
                }
              >
                <span className="google-acc-avatar">EA</span>
                <div className="google-acc-info">
                  <strong>EMS Admin</strong>
                  <span>admin.ems@gmail.com</span>
                </div>
                <span className="google-acc-arrow">→</span>
              </button>

              <div className="auth-divider"><span>or use your Gmail</span></div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInstantGoogleLogin(googleName, googleEmail);
                }}
              >
                <div className="auth-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nikhil Sharma"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Google Email</label>
                  <input
                    type="email"
                    placeholder="e.g. nikhil@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? <span className="auth-spinner" /> : null}
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
