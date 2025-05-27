import React, { useEffect, useState } from "react";
import { useAuth } from "./App"; // Import the custom auth context hook

export default function Finances() {
  const { authFetch } = useAuth(); // Get the authFetch function from context

  const [transactions, setTransactions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '', type: '' });
  const [form, setForm] = useState({ amount: '', description: '', type: 'income' });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    authFetch("/api/transactions")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
      })
      .then(data => setTransactions(Array.isArray(data) ? data : data.transactions || []))
      .catch(() => alert('Failed to fetch transactions'));
  }, [authFetch]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const res = await authFetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to add transaction");
      setTransactions([...transactions, data.transaction || data]);
      setForm({ amount: "", description: "", type: "income" });
    } catch (err) {
      setAddError(err.message);
    }
    setAdding(false);
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this transaction?')) return;
    authFetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setTransactions(transactions.filter(txn => txn._id !== id));
      })
      .catch(() => alert('Error deleting transaction'));
  };

  const handleEdit = txn => {
    setEditId(txn._id);
    setEditForm({
      amount: txn.amount,
      description: txn.description,
      type: txn.type
    });
  };

  const handleEditFormChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = e => {
    e.preventDefault();
    authFetch(`/api/transactions/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
      .then(res => res.json())
      .then(updatedTxn => {
        setTransactions(transactions.map(txn => (txn._id === editId ? updatedTxn : txn)));
        setEditId(null);
      })
      .catch(() => alert('Update failed'));
  };

  // Totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Finances</h2>
      <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total Income" value={totalIncome} color="#4caf50" />
        <StatCard label="Total Expense" value={totalExpense} color="#e53935" />
        <StatCard label="Balance" value={balance} color="#556cd6" />
      </div>

      {/* Add Transaction Form */}
      <form onSubmit={handleAdd} style={formStyle}>
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required style={inputStyle} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required style={inputStyle} />
        <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button type="submit" disabled={adding} style={btnStyle}>
          {adding ? "Adding..." : "Add Transaction"}
        </button>
        {addError && <span style={{ color: '#e53935', marginLeft: 8 }}>{addError}</span>}
      </form>

      <h3>Transaction List</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead style={{ background: "#f6f7fb" }}>
            <tr>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} style={emptyRowStyle}>No transactions yet.</td>
              </tr>
            )}
            {transactions.map(txn =>
              editId === txn._id ? (
                <tr key={txn._id} style={rowHighlightStyle}>
                  <td style={tdStyle}><input name="amount" type="number" value={editForm.amount} onChange={handleEditFormChange} required style={{ ...inputStyle, width: "80px" }} /></td>
                  <td style={tdStyle}><input name="description" value={editForm.description} onChange={handleEditFormChange} required style={{ ...inputStyle, width: "120px" }} /></td>
                  <td style={tdStyle}>
                    <select name="type" value={editForm.type} onChange={handleEditFormChange} required style={inputStyle}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={handleUpdate} style={btnStyle}>Save</button>
                    <button type="button" onClick={() => setEditId(null)} style={{ ...btnStyle, background: "#bbb", marginLeft: 8 }}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={txn._id} style={{ textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <td style={tdStyle}>
                    <span style={{ color: txn.type === 'income' ? "#4caf50" : "#e53935", fontWeight: 600 }}>
                      {txn.type === 'income' ? "+" : "-"}${Number(txn.amount).toLocaleString()}
                    </span>
                  </td>
                  <td style={tdStyle}>{txn.description}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: txn.type === 'income' ? "#e7fbe8" : "#fff0f0",
                      color: txn.type === 'income' ? "#388e3c" : "#b71c1c",
                      borderRadius: 12,
                      padding: "2px 12px",
                      fontWeight: 500
                    }}>
                      {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(txn)} style={btnStyle}>Edit</button>
                    <button onClick={() => handleDelete(txn._id)} style={{ ...btnStyle, background: "#e53935", marginLeft: 6 }}>Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// (Optional) StatCard and styles here - keep same as your original code

function StatCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 140,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      padding: "1.1rem 1rem",
      textAlign: "center"
    }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>
        {value < 0 ? '-' : ''}${Math.abs(value).toLocaleString()}
      </div>
    </div>
  );
}

// Styles (same as your original)
const thStyle = { padding: "10px 8px", fontWeight: 700, fontSize: 16, borderBottom: "2px solid #eee" };
const tdStyle = { padding: "8px 6px", fontWeight: 400, fontSize: 15 };
const inputStyle = { padding: "0.5rem", borderRadius: 5, border: "1px solid #ccd1e0", minWidth: 80 };
const btnStyle = { padding: "0.47rem 1.05rem", borderRadius: 5, border: "none", background: "#556cd6", color: "#fff", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" };
const formStyle = { marginBottom: 32, display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", background: "#f6f7fb", borderRadius: 8, padding: "1.1rem" };
const rowHighlightStyle = { background: "#f6faff" };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" };
const emptyRowStyle = { textAlign: "center", padding: "1.5rem", color: "#999" };
