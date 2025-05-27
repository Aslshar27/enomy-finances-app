import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} type="email" required />
      <input name="password" placeholder="Password" value={form.password} onChange={handleChange} type="password" required />
      <button type="submit">Register</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div style={{marginTop: 10}}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </form>
  );
}