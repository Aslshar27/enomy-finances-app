import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Finances from "./Finances";
import CurrencyConverter from "./CurrencyConverter";
import Dashboard from "./Dashboard";
import InvestmentCalculator from "./InvestmentCalculator";
import "./App.css";

// --- Auth Context Setup ---
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// --- Registration Form ---
function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Registration failed");
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-box-v2">
      <form onSubmit={handleSubmit} className="form-styled-v2">
        <h2>Sign Up</h2>
        <input className="input-styled-v2" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input className="input-styled-v2" name="email" placeholder="Email Address" type="email" value={form.email} onChange={handleChange} required />
        <input className="input-styled-v2" name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
        <button className="btn-main-v2" type="submit">Create Account</button>
        {error && <div className="error-msg-v2">{error}</div>}
        <div className="register-link-row">
          Already have an account? <Link to="/" className="register-link">Login</Link>
        </div>
      </form>
    </div>
  );
}

// --- Login Form (used in Home if not logged in) ---
function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Login failed");
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-hero-bg-v2">
      {/* SVG abstract background */}
      <svg className="login-bg-blob-v2" viewBox="0 0 900 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="loginBlobGradientV2" cx="50%" cy="50%" r="90%">
            <stop offset="0%" stopColor="#9de7c1" />
            <stop offset="100%" stopColor="#3bb6a7" />
          </radialGradient>
        </defs>
        <ellipse
          cx="450"
          cy="420"
          rx="340"
          ry="340"
          fill="url(#loginBlobGradientV2)"
          opacity="0.23"
        />
        <ellipse
          cx="650"
          cy="200"
          rx="120"
          ry="120"
          fill="#ffe3a3"
          opacity="0.22"
        />
      </svg>
      <div>
        <div className="login-hero-card-v2">
          <div className="login-brand-header-v2">
            <span className="login-logo-v2" role="img" aria-label="wallet">🌱</span>
            <div className="login-brand-title-v2">Enomy Finances</div>
          </div>
          <div className="login-welcome-v2">
            <h2 className="login-title-v2">Welcome!</h2>
            <div className="login-tagline-v2">
              <span>Access your personal finance portal</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="form-styled-v2">
            <input className="input-styled-v2" name="email" placeholder="Email Address" type="email" value={form.email} onChange={handleChange} required />
            <input className="input-styled-v2" name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
            <button className="btn-main-v2" type="submit">Login</button>
            {error && <div className="error-msg-v2">{error}</div>}
          </form>
          <div className="register-link-row">
            Don't have an account? <Link to="/register" className="register-link">Register</Link>
          </div>
          <div className="login-footer-tip-v2">
            <span role="img" aria-label="star">🌟</span>
            <span>Modern tools for smart money management.</span>
          </div>
        </div>
        <div className="login-extra-message-v2">
          <div className="login-quote-v2">
            “Financial freedom starts with a single insight.”
          </div>
          <div>
            Simple • Secure • Refreshingly different.
          </div>
        </div>
      </div>
      <div className="login-footer-attract-v2">
        © {new Date().getFullYear()} Enomy Finances &mdash; Designed for simplicity.
      </div>
    </div>
  );
}

// --- User Info (just name, no logout, styled for body) ---
export function UserInfo() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="userinfo-box-v2">
      <span>
        Hi, <span style={{fontWeight:600, color:"#3bb6a7"}}>{user.name}</span>
      </span>
    </div>
  );
}

// --- Logout Button in Navbar ---
function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button className="btn-logout-navbar-v2" onClick={logout}>
      <span role="img" aria-label="logout" style={{marginRight: 7}}>⏏️</span>
      Logout
    </button>
  );
}

// --- Protected Route ---
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// --- Home Page ---
function Home() {
  const [apiMessage, setApiMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.text())
      .then((data) => setApiMessage(data))
      .catch(() => setApiMessage("Error connecting to backend"));
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="welcome-landing-v2">
      <div className="home-hero-icon-v2"><span role="img" aria-label="growth">📊</span></div>
      <div className="home-headline-v2">Welcome to Enomy Finances!</div>
      <div className="home-desc-v2">
        Your modern dashboard for budgeting, currency conversion, and investment tracking.<br />
        <span className="api-status-v2">{apiMessage}</span>
      </div>
    </div>
  );
}

// --- Layout: sidebar navigation for a new look ---
function Layout({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="main-layout-v2">
      <aside className="sidebar-v2">
        <div className="sidebar-brand-v2">
          <span role="img" aria-label="leaf">🌱</span> Enomy Finances
        </div>
        <nav className="sidebar-links-v2">
          <Link to="/dashboard" className="sidebar-link-v2">🏠 Dashboard</Link>
          <Link to="/finances" className="sidebar-link-v2">💰 Finances</Link>
          <Link to="/convert" className="sidebar-link-v2">💱 Convert</Link>
          <Link to="/investment-calculator" className="sidebar-link-v2">📈 Calculator</Link>
        </nav>
        <div className="sidebar-footer-v2">
          <LogoutButton />
        </div>
      </aside>
      <main className="app-container-v2">
        {children}
      </main>
    </div>
  );
}

// --- App Component ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>
                    <UserInfo />
                    <h1 className="dashboard-title-v2">
                      Dashboard
                    </h1>
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/finances"
              element={
                <ProtectedRoute>
                  <Finances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/convert"
              element={
                <ProtectedRoute>
                  <CurrencyConverter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investment-calculator"
              element={
                <ProtectedRoute>
                  <InvestmentCalculator />
                </ProtectedRoute>
              }
            />
            {/* fallback for any unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}