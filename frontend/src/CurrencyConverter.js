import React, { useState } from "react";
import API_BASE_URL from "./config"; // <-- import your centralized API url

const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "CHF"];

export default function CurrencyConverter() {
  const [form, setForm] = useState({ from: "USD", to: "EUR", amount: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSwitch = () => {
    setForm(f => ({ ...f, from: f.to, to: f.from }));
    setResult(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Conversion failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="ccard-v2">
      <div className="ccard-v2-header">
        <span className="ccard-v2-logo" role="img" aria-label="globe">🌎</span>
        <span className="ccard-v2-title">Currency Converter</span>
      </div>
      <div className="ccard-v2-desc">
        Convert your money across major currencies, instantly and securely.
      </div>
      <form className="ccard-v2-form" onSubmit={handleSubmit}>
        <input
          className="ccard-v2-input"
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          min="0"
          step="any"
          onChange={handleChange}
          required
        />
        <div className="ccard-v2-select-row">
          <select className="ccard-v2-select" name="from" value={form.from} onChange={handleChange}>
            {currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
          </select>
          <button type="button" className="ccard-v2-swap" onClick={handleSwitch} aria-label="Swap">
            ⇄
          </button>
          <select className="ccard-v2-select" name="to" value={form.to} onChange={handleChange}>
            {currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
          </select>
        </div>
        <button className="ccard-v2-btn" type="submit" disabled={loading}>
          {loading ? "Converting..." : "Convert"}
        </button>
      </form>
      {error && <div className="ccard-v2-error">{error}</div>}
      {result && (
        <div className="ccard-v2-result">
          <div className="ccard-v2-result-row">
            <span>Rate:</span>
            <span>{result.rate}</span>
          </div>
          <div className="ccard-v2-result-row">
            <span>Converted:</span>
            <span>
              {Number(result.converted).toFixed(2)} {result.to}
            </span>
          </div>
          <div className="ccard-v2-result-row">
            <span>Company fee:</span>
            <span>
              {Number(result.fee).toFixed(2)} {result.to}
            </span>
          </div>
          <div className="ccard-v2-result-row ccard-v2-result-main">
            <span>Total after fee:</span>
            <span>
              <strong style={{ color: "#3bb6a7" }}>
                {Number(result.totalAfterFee).toFixed(2)} {result.to}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}