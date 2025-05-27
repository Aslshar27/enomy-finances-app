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

// --- CORS: List all allowed origins ---
const allowedOrigins = [
  'https://enomy-finances.vercel.app',
  'https://enomy-finances-app.vercel.app',
  'https://enomy-finances-7weu0ghv7-aslam-mulaffers-projects.vercel.app',
  'http://localhost:3000',
];

// --- CORS middleware (must be very first!) ---
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow server-to-server, Postman, etc.
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/enomy-finances.*\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS

// --- JSON parser ---
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

// --- CORS error handler (MUST be before general error handler) ---
app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ msg: err.message });
  }
  next(err);
});

// --- General error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Internal Server Error" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));