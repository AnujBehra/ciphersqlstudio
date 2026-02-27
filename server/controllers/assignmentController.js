const Assignment = require('../models/Assignment');

/**
 * GET /api/assignments
 * Fetch all assignments (listing page)
 */
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .select('title description question createdAt')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
};

/**
 * GET /api/assignments/:id
 * Fetch a single assignment with full details
 */
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
};

module.exports = { getAssignments, getAssignmentById };
