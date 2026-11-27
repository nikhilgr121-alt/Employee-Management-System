import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginWithEmail, registerWithEmail } from "../services/authService";
import { BuildingIcon } from "../components/Icons";

export default function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab]       = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  // Login fields
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);

  // Register fields
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPw, setRPw]     = useState("");
  const [rPwC, setRPwC]   = useState("");

  const clear = () => setError("");

  const handleLogin = async (e) => {
    e.preventDefault();
    clear();
    if (!email.trim() || !password) return setError("Email and password are required.");
    setLoading(true);
    try {
      const data = await loginWithEmail(email.trim(), password);
      // data = { success, token, user }
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clear();
    if (!rName.trim() || !rEmail.trim() || !rPw || !rPwC)
      return setError("All fields are required.");
    if (rPw.length < 6)
      return setError("Password must be at least 6 characters.");
    if (rPw !== rPwC)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      const data = await registerWithEmail(rName.trim(), rEmail.trim(), rPw);
      // data = { success, token, user }
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Top banner */}
        <div className="auth-top">
          <div className="auth-logo"><BuildingIcon /></div>
          <div className="auth-heading">Employee Management System</div>
          <div className="auth-sub">Manage your workforce efficiently</div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); clear(); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); clear(); }}
          >
            Create Account
          </button>
        </div>

        <div className="auth-body">

          {/* Error message */}
          {error && <div className="auth-alert auth-err">⚠ {error}</div>}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading && <span className="auth-spinner" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p className="auth-switch">
                No account?{" "}
                <button type="button" className="auth-link" onClick={() => { setTab("register"); clear(); }}>
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} noValidate>
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Aarav Sharma"
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="aarav@company.com"
                  value={rEmail}
                  onChange={(e) => setREmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label>Password (min 6 chars)</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={rPw}
                  onChange={(e) => setRPw(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={rPwC}
                  onChange={(e) => setRPwC(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading && <span className="auth-spinner" />}
                {loading ? "Creating Account..." : "Create Account"}
              </button>
              <p className="auth-switch">
                Have an account?{" "}
                <button type="button" className="auth-link" onClick={() => { setTab("login"); clear(); }}>
                  Sign In
                </button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
