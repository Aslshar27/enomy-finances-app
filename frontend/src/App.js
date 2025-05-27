import React, { useEffect, useState, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  Outlet,
} from "react-router-dom";
import Finances from "./Finances";
import CurrencyConverter from "./CurrencyConverter";
import Dashboard from "./Dashboard";
import InvestmentCalculator from "./InvestmentCalculator";
import API_BASE_URL from "./config";
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

  // Helper fetch function that includes JWT token in Authorization header
  const authFetch = (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch }}>
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <input
          className="input-styled-v2"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="input-styled-v2"
          name="email"
          placeholder="Email Address"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="input-styled-v2"
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn-main-v2" type="submit">
          Create Account
        </button>
        {error && <div className="error-msg-v2">{error}</div>}
        <div className="register-link-row">
          Already have an account? <Link to="/" className="register-link">Login</Link>
        </div>
      </form>
    </div>
  );
}

// --- Login Form ---
function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

// --- User Info ---
export function UserInfo() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="userinfo-box-v2">
      <span>
        Hi, <span style={{ fontWeight: 600, color: "#3bb6a7" }}>{user.name}</span>
      </span>
    </div>
  );
}

// --- Logout Button ---
function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <button className="btn-logout-navbar-v2" onClick={handleLogout}>
      <span role="img" aria-label="logout" style={{ marginRight: 7 }}>⏏️</span>
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
  const { user, authFetch } = useAuth();

  useEffect(() => {
    if (!user) {
      setApiMessage("Please login to see status");
      return;
    }

    authFetch(`${API_BASE_URL}/`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.text();
      })
      .then(data => setApiMessage(data))
      .catch(() => setApiMessage("Error connecting to backend"));
  }, [user, authFetch]);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="welcome-landing-v2">
      <div className="home-hero-icon-v2"><span role="img" aria-label="growth">📊</span></div>
      <div className="home-headline-v2">Welcome to Enomy Finances!</div>
      <div className="home-desc-v2">
        Your modern, smart personal finance portal.
      </div>
      <div>
        Backend API says: {apiMessage}
      </div>
    </div>
  );
}

// --- Layout with Navbar, UserInfo, LogoutButton ---
function Layout({ children }) {
  return (
    <>
      <nav className="navbar-v2">
        <Link to="/" className="navbar-brand-v2">
          Enomy Finances
        </Link>
        <UserInfo />
        <LogoutButton />
      </nav>
      <main>{children}</main>
    </>
  );
}

// --- Main App ---
// Add a /convert route as an alias to /currency-converter
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finances"
            element={
              <ProtectedRoute>
                <Layout>
                  <Finances />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/currency-converter"
            element={
              <ProtectedRoute>
                <Layout>
                  <CurrencyConverter />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Fix: Add /convert as alias route for /currency-converter */}
          <Route
            path="/convert"
            element={
              <ProtectedRoute>
                <Layout>
                  <CurrencyConverter />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investment-calculator"
            element={
              <ProtectedRoute>
                <Layout>
                  <InvestmentCalculator />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}