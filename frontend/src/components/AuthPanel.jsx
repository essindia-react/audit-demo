import { useState } from "react";
import PropTypes from "prop-types";

function AuthPanel({ mode, onModeChange, onLogin, onRegister, loading }) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ full_name: "", email: "", password: "" });

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    onLogin({ ...loginForm });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    onRegister({ ...registerForm });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <header>
          <h1>Procurement Audit Portal</h1>
          <p className="muted">Sign in to manage audits, compliance modules, and monitoring insights.</p>
          <div className="auth-toggle">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => onModeChange("login")}>Login</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => onModeChange("register")}>Register</button>
          </div>
        </header>

        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLoginSubmit}>
            <label>
              <span>Email</span>
              <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange} placeholder="auditor@agency.gov" required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} placeholder="********" required />
            </label>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegisterSubmit}>
            <label>
              <span>Full name</span>
              <input name="full_name" value={registerForm.full_name} onChange={handleRegisterChange} placeholder="Jane Doe" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" value={registerForm.email} onChange={handleRegisterChange} placeholder="auditor@agency.gov" required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" value={registerForm.password} onChange={handleRegisterChange} placeholder="********" required />
            </label>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

AuthPanel.propTypes = {
  mode: PropTypes.oneOf(["login", "register"]).isRequired,
  onModeChange: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AuthPanel.defaultProps = {
  loading: false,
};

export default AuthPanel;
