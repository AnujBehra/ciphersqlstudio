const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectMongoDB = require('../server/config/mongodb');
const { connectPostgres } = require('../server/config/postgres');

const assignmentRoutes = require('../server/routes/assignmentRoutes');
const queryRoutes = require('../server/routes/queryRoutes');
const hintRoutes = require('../server/routes/hintRoutes');
const authRoutes = require('../server/routes/authRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many requests.' },
});

const hintLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many hint requests.' },
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CipherSQLStudio API is running' });
});

app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryLimiter, queryRoutes);
app.use('/api/hint', hintLimiter, hintRoutes);
app.use('/api/auth', authRoutes);

// DB connection (cached for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await connectMongoDB();
  await connectPostgres();
  isConnected = true;
};

// Wrap Express for Vercel serverless
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
