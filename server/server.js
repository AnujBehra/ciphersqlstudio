const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectMongoDB = require('./config/mongodb');
const { connectPostgres } = require('./config/postgres');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const assignmentRoutes = require('./routes/assignmentRoutes');
const queryRoutes = require('./routes/queryRoutes');
const hintRoutes = require('./routes/hintRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting for query execution and hint generation
const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const hintLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // 10 hints per minute
  message: { success: false, error: 'Too many hint requests. Please try again later.' },
});

// ─── Routes ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CipherSQLStudio API is running' });
});

app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryLimiter, queryRoutes);
app.use('/api/hint', hintLimiter, hintRoutes);
app.use('/api/auth', authRoutes);

// ─── Serve React Frontend in Production ─────────────────────
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// ─── Error Handling ─────────────────────────────────────────
app.use('/api/*', notFound);

// All other routes serve the React app (SPA client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────
const startServer = async () => {
  await connectMongoDB();
  await connectPostgres();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 CipherSQLStudio server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
};

startServer();
