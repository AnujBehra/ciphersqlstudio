const Assignment = require('../models/Assignment');
const { generateHint } = require('../services/llmService');
const mongoose = require('mongoose');
const path = require('path');

// Fallback assignments from JSON
let fallbackAssignments = null;
const getFallbackAssignment = (id) => {
  if (!fallbackAssignments) {
    try {
      const data = require(path.join(__dirname, '../../CipherSqlStudio-assignment.json'));
      fallbackAssignments = data.map((a, i) => ({ _id: `fallback_${i}`, ...a }));
    } catch (e) {
      fallbackAssignments = [];
    }
  }
  return fallbackAssignments.find(a => a._id === id);
};

/**
 * POST /api/hint
 * Get an LLM-powered hint for an assignment
 */
const getHint = async (req, res) => {
  try {
    const { assignmentId, userQuery } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID is required.',
      });
    }

    let assignment;
    if (mongoose.connection.readyState === 1) {
      assignment = await Assignment.findById(assignmentId);
    }
    if (!assignment) {
      assignment = getFallbackAssignment(assignmentId);
    }
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    const result = await generateHint(assignment, userQuery || '');

    if (result.success) {
      res.json({ success: true, hint: result.hint });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate hint.' });
  }
};

module.exports = { getHint };
