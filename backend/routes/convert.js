const API_KEY = "8ffff5d67aae8b86c2410065";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;
const COMPANY_FEE_PERCENT = 2;

// If running on Node 18+, fetch is built-in. Otherwise, uncomment the next line:
// const fetch = require('node-fetch');

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ msg: "Method Not Allowed" });
    return;
  }

  const { from, to, amount } = req.body;
  if (!from || !to || !amount) {
    res.status(400).json({ msg: "Missing required fields" });
    return;
  }

  try {
    const apiRes = await fetch(`${BASE_URL}/${from}`);
    const data = await apiRes.json();

    if (data.result !== "success") {
      res.status(500).json({ msg: "Failed to fetch rates" });
      return;
    }

    const rate = data.conversion_rates[to];
    if (!rate) {
      res.status(400).json({ msg: "Invalid target currency" });
      return;
    }

    const converted = Number(amount) * rate;
    const fee = (converted * COMPANY_FEE_PERCENT) / 100;
    const total = converted - fee;

    res.status(200).json({
      from,
      to,
      amount: Number(amount),
      rate,
      converted,
      fee,
      totalAfterFee: total,
    });
  } catch (err) {
    res.status(500).json({ msg: "Conversion failed", error: err.message });
  }
}