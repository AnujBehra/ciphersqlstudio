const Assignment = require('../models/Assignment');
const { generateHint } = require('../services/llmService');

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

    const assignment = await Assignment.findById(assignmentId);
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
