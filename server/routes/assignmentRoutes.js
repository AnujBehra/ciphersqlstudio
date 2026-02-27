const express = require('express');
const router = express.Router();
const { getAssignments, getAssignmentById } = require('../controllers/assignmentController');

// GET /api/assignments - List all assignments
router.get('/', getAssignments);

// GET /api/assignments/:id - Get single assignment
router.get('/:id', getAssignmentById);

module.exports = router;
