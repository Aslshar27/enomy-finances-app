const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const transactionsRoute = require('./routes/transactions');
const convertRoute = require('./routes/convert');
const quotesRoute = require('./routes/quotes');
const dashboardRoutes = require('./routes/dashboard');

require('dotenv').config();

const app = express();

// --- UPDATED: Add all relevant origins for production, preview, and local dev ---
const allowedOrigins = [
  'https://enomy-finances.vercel.app', // production
  'https://enomy-finances-app.vercel.app', // old/alternate domain
  'https://enomy-finances-7weu0ghv7-aslam-mulaffers-projects.vercel.app', // preview deploy
  'http://localhost:3000', // local dev
];

// CORS middleware with origin check and allowed headers
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);  // Allow non-browser requests like Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // For Vercel preview deploys (optional: allows any *.vercel.app domain)
    if (/^https:\/\/enomy-finances.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Express JSON parser
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/enomy-finances", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// --- Routes ---
app.get("/", (req, res) => res.send("Enomy-Finances API running"));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoute);
app.use('/api/convert', convertRoute);
app.use('/api/quotes', quotesRoute);
app.use('/api/dashboard', dashboardRoutes);

// --- CORS error handler ---
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ msg: err.message });
  }
  next(err);
});

// --- General error handler (optional, for better debugging) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Internal Server Error" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));