import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// V2 Dashboard: new look, no investment quote/history, modern pastel cards, motivational header

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        // Fetch summary stats
        const statsRes = await fetch("/api/dashboard/summary", {
          headers: { Authorization: "Bearer " + token }
        });
        if (!statsRes.ok) throw new Error("Failed to fetch summary");
        const statsData = await statsRes.json();

        // Fetch activity
        const activityRes = await fetch("/api/dashboard/activity", {
          headers: { Authorization: "Bearer " + token }
        });
        if (!activityRes.ok) throw new Error("Failed to fetch activity");
        const activityData = await activityRes.json();

        setStats(statsData);
        setActivity(activityData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-v2-loading">
        <h2>Dashboard</h2>
        <div>Loading...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dashboard-v2-error">
        <h2>Dashboard</h2>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-v2-root">
      <div className="dashboard-v2-header">
        <span className="dashboard-v2-emoji" role="img" aria-label="chart">📈</span>
        <div>
          <div className="dashboard-v2-title">Overview</div>
          <div className="dashboard-v2-subtitle">
            Track your money with clarity and confidence.
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-v2-stats-row">
        <StatCard
          label="Income"
          value={formatMoney(stats.income)}
          color="#3bb6a7"
          icon="🟢"
        />
        <StatCard
          label="Expenses"
          value={formatMoney(stats.expense)}
          color="#ef768c"
          icon="🔴"
        />
        <StatCard
          label="Balance"
          value={formatMoney(stats.balance)}
          color="#ffe3a3"
          icon="🟡"
        />
      </div>

      {/* Activity (recent transaction & conversion) */}
      <div className="dashboard-v2-activity-card">
        <div className="dashboard-v2-activity-title">Recent Activity</div>
        <ul className="dashboard-v2-activity-list">
          <li>
            Last transaction:{" "}
            <b>
              {activity && activity.lastTransaction
                ? `${activity.lastTransaction.type} of ${formatMoney(activity.lastTransaction.amount)}`
                : "N/A"}
            </b>
            {activity && activity.lastTransaction && activity.lastTransaction.date
              ? ` (${activity.lastTransaction.date})`
              : ""}
            &nbsp; – <Link to="/finances" className="dashboard-v2-link">See All</Link>
          </li>
          <li>
            Last conversion:{" "}
            <b>
              {activity && activity.lastConversion
                ? `${activity.lastConversion.amount} ${activity.lastConversion.from} → ${activity.lastConversion.to}`
                : "N/A"}
            </b>
            {activity && activity.lastConversion && activity.lastConversion.date
              ? ` (${activity.lastConversion.date})`
              : ""}
            &nbsp; – <Link to="/convert" className="dashboard-v2-link">Go to Converter</Link>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-v2-actions-row">
        <QuickAction label="Add Transaction" to="/finances" icon="➕" color="#3bb6a7" />
        <QuickAction label="Convert Currency" to="/convert" icon="💱" color="#ef768c" />
        <QuickAction label="Investment Calculator" to="/investment-calculator" icon="🧮" color="#ffe3a3" />
      </div>
      <div className="dashboard-v2-motivation">
        <span role="img" aria-label="bulb">🌿</span>
        <span>Every little step counts toward your financial growth.</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="dashboard-v2-stat-card"
      style={{
        borderTop: `5px solid ${color}`,
      }}
    >
      <div className="dashboard-v2-stat-icon" style={{ color }}>{icon}</div>
      <div className="dashboard-v2-stat-label">{label}</div>
      <div className="dashboard-v2-stat-value" style={{ color }}>{value}</div>
    </div>
  );
}

function QuickAction({ label, to, icon, color }) {
  return (
    <Link to={to} className="dashboard-v2-action-btn" style={{ borderLeft: `5px solid ${color}` }}>
      <div className="dashboard-v2-action-icon" style={{ color }}>{icon}</div>
      <div>{label}</div>
    </Link>
  );
}

function formatMoney(amount) {
  if (typeof amount !== "number") return "$0";
  return "$" + amount.toLocaleString();
}