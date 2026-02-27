const express = require('express');
const router = express.Router();
const { runQuery } = require('../controllers/queryController');
const { optionalAuth } = require('../middleware/auth');

// POST /api/query/execute - Execute a SQL query
router.post('/execute', optionalAuth, runQuery);

module.exports = router;
