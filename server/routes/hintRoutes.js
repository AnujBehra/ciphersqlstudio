const express = require('express');
const router = express.Router();
const { getHint } = require('../controllers/hintController');

// POST /api/hint - Get LLM hint for assignment
router.post('/', getHint);

module.exports = router;
