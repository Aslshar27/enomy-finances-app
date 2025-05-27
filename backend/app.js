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

// Define allowed origins (add your frontend URLs here)
const allowedOrigins = [
  'https://enomy-finances-app.vercel.app',
  'http://localhost:3000' // your local dev frontend (optional)
];

// CORS middleware with explicit origin checking and preflight support
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // if you use cookies or auth headers
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors({
  origin: allowedOrigins
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/enomy-finances", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Enomy-Finances API running"));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoute);
app.use('/api/convert', convertRoute);
app.use('/api/quotes', quotesRoute);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
