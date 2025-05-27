import React, { useState } from "react";

const plans = [
  {
    key: "basic",
    name: "Basic Savings Plan",
    maxPerYear: 20000,
    minMonthly: 50,
    minLump: 0,
    returnMin: 0.012,
    returnMax: 0.024,
    fee: 0.0025, // monthly
    tax: {},
    taxLabel: "0%",
    feeLabel: "0.25%"
  },
  {
    key: "plus",
    name: "Savings Plan Plus",
    maxPerYear: 30000,
    minMonthly: 50,
    minLump: 300,
    returnMin: 0.03,
    returnMax: 0.055,
    fee: 0.003,
    tax: { threshold: 12000, rate: 0.1 },
    taxLabel: "10% on profits above £12,000",
    feeLabel: "0.3%"
  },
  {
    key: "managed",
    name: "Managed Stock Investments",
    maxPerYear: null,
    minMonthly: 150,
    minLump: 1000,
    returnMin: 0.04,
    returnMax: 0.23,
    fee: 0.003,
    tax: [
      { threshold: 40000, rate: 0.2 },
      { threshold: 12000, rate: 0.1 }
    ],
    taxLabel: "10% on profits above £12,000, 20% above £40,000",
    feeLabel: "0.3%"
  }
];

function formatGBP(x) {
  if (isNaN(x)) return "-";
  return "£" + Number(x).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateInvestment({ lump, monthly, planKey }) {
  const plan = plans.find(p => p.key === planKey);
  if (!plan) throw new Error("Unknown plan");
  const yearsArr = [1, 5, 10];

  return yearsArr.map(years => {
    const result = {};

    // Compound interest monthly
    function futureValue(rate, fee, taxObj) {
      let months = years * 12;
      let balance = lump;
      let totalInvested = lump;
      let totalFees = 0;
      let totalMonthly = 0;

      let r = rate / 12;

      for (let m = 1; m <= months; ++m) {
        balance += monthly;
        totalMonthly += monthly;
        totalInvested += monthly;

        balance *= (1 + r);

        let feeAmt = balance * fee;
        balance -= feeAmt;
        totalFees += feeAmt;
      }

      let profit = balance - totalInvested;
      let taxPaid = 0;
      if (plan.key === "basic") {
        taxPaid = 0;
      } else if (plan.key === "plus") {
        if (profit > 12000) {
          taxPaid = (profit - 12000) * 0.1;
        }
      } else if (plan.key === "managed") {
        if (profit > 40000) {
          taxPaid = (40000 - 12000) * 0.1 + (profit - 40000) * 0.2;
        } else if (profit > 12000) {
          taxPaid = (profit - 12000) * 0.1;
        }
      }
      if (taxPaid < 0) taxPaid = 0;

      return {
        value: balance - taxPaid,
        profit: profit - taxPaid,
        fees: totalFees,
        tax: taxPaid
      };
    }

    const min = futureValue(plan.returnMin, plan.fee);
    const max = futureValue(plan.returnMax, plan.fee);

    result.years = years;
    result.minValue = min.value;
    result.maxValue = max.value;
    result.minProfit = min.profit;
    result.maxProfit = max.profit;
    result.minFees = min.fees;
    result.maxFees = max.fees;
    result.minTax = min.tax;
    result.maxTax = max.tax;
    return result;
  });
}

export default function InvestmentCalculator() {
  const [planKey, setPlanKey] = useState("basic");
  const [lump, setLump] = useState("");
  const [monthly, setMonthly] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [systemError, setSystemError] = useState(null);

  const plan = plans.find(p => p.key === planKey);

  function validate() {
    let errs = {};
    const lumpVal = Number(lump);
    const monthlyVal = Number(monthly);

    if (isNaN(lumpVal) || lumpVal < 0) {
      errs.lump = "Initial lump sum must be a positive number.";
    } else if (plan.minLump && lumpVal < plan.minLump) {
      errs.lump = `Minimum initial lump sum is £${plan.minLump}.`;
    }

    if (isNaN(monthlyVal) || monthlyVal < 0) {
      errs.monthly = "Monthly investment must be a positive number.";
    } else if (monthlyVal < plan.minMonthly) {
      errs.monthly = `Minimum monthly investment is £${plan.minMonthly}.`;
    }

    const yearTotal = lumpVal + monthlyVal * 12;
    if (plan.maxPerYear && yearTotal > plan.maxPerYear) {
      errs.maxPerYear = `Total investment per year exceeds maximum of £${plan.maxPerYear}.`;
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    setSystemError(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = calculateInvestment({
        lump: Number(lump),
        monthly: Number(monthly),
        planKey
      });
      setResult(res);
      setErrors({});
    } catch (err) {
      setSystemError("An internal error occurred. Please try again or contact support.");
      console.error("InvestmentCalculator error", {
        error: err,
        data: { lump, monthly, planKey }
      });
    }
  }

  function handlePlanChange(e) {
    setPlanKey(e.target.value);
    setErrors({});
    setResult(null);
  }

  return (
    <div className="invcalc-v2-card">
      <div className="invcalc-v2-header">
        <span className="invcalc-v2-logo" role="img" aria-label="chart">🌿</span>
        <span className="invcalc-v2-title">Investment Calculator</span>
      </div>
      <div className="invcalc-v2-desc">
        See how your savings could grow with different plans and rates.
      </div>
      <form className="invcalc-v2-form" onSubmit={handleSubmit}>
        <div className="invcalc-v2-row">
          <div className="invcalc-v2-col">
            <label htmlFor="plan-type" className="invcalc-v2-label">Plan</label>
            <select value={planKey} id="plan-type" onChange={handlePlanChange} className="invcalc-v2-select">
              {plans.map(p => (
                <option value={p.key} key={p.key}>{p.name}</option>
              ))}
            </select>
            <div className="invcalc-v2-plan-desc">
              <b>Return:</b> {Math.round(plan.returnMin * 100)}% to {Math.round(plan.returnMax * 100)}%/yr<br />
              <b>Fee:</b> {plan.feeLabel}<br />
              <b>Tax:</b> {plan.taxLabel}
            </div>
          </div>
          <div className="invcalc-v2-col">
            <label htmlFor="lump" className="invcalc-v2-label">Initial (£)</label>
            <input
              className="invcalc-v2-input"
              id="lump"
              type="number"
              min="0"
              step="any"
              value={lump}
              onChange={e => setLump(e.target.value)}
              placeholder={`e.g. ${plan.minLump}`}
            />
            {errors.lump && <span className="invcalc-v2-error">{errors.lump}</span>}
          </div>
          <div className="invcalc-v2-col">
            <label htmlFor="monthly" className="invcalc-v2-label">Monthly (£)</label>
            <input
              className="invcalc-v2-input"
              id="monthly"
              type="number"
              min="0"
              step="any"
              value={monthly}
              onChange={e => setMonthly(e.target.value)}
              placeholder={`e.g. ${plan.minMonthly}`}
            />
            {errors.monthly && <span className="invcalc-v2-error">{errors.monthly}</span>}
          </div>
        </div>
        <button type="submit" className="invcalc-v2-btn">
          Calculate
        </button>
      </form>
      {errors.maxPerYear && <div className="invcalc-v2-error">{errors.maxPerYear}</div>}
      {systemError && <div className="invcalc-v2-error">{systemError}</div>}
      {result && (
        <div className="invcalc-v2-result">
          <h3>Projection</h3>
          <table className="invcalc-v2-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Min Value</th>
                <th>Max Value</th>
                <th>Profit</th>
                <th>Fees</th>
                <th>Tax</th>
              </tr>
            </thead>
            <tbody>
              {result.map((row, idx) => (
                <tr key={row.years}>
                  <td>{row.years} year{row.years > 1 ? "s" : ""}</td>
                  <td>{formatGBP(row.minValue)}</td>
                  <td>{formatGBP(row.maxValue)}</td>
                  <td>
                    {formatGBP(row.minProfit)}<br />
                    <span className="invcalc-v2-subtle">to {formatGBP(row.maxProfit)}</span>
                  </td>
                  <td>
                    {formatGBP(row.minFees)}<br />
                    <span className="invcalc-v2-subtle">to {formatGBP(row.maxFees)}</span>
                  </td>
                  <td>
                    {formatGBP(row.minTax)}<br />
                    <span className="invcalc-v2-subtle">to {formatGBP(row.maxTax)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="invcalc-v2-note">
            All values are estimates and do not guarantee future returns.
          </div>
        </div>
      )}
    </div>
  );
}