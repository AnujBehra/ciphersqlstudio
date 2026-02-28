const Assignment = require('../models/Assignment');
const path = require('path');
const mongoose = require('mongoose');

// Fallback data from JSON file for when MongoDB is unavailable
let fallbackAssignments = null;
const getFallbackAssignments = () => {
  if (!fallbackAssignments) {
    try {
      const data = require(path.join(__dirname, '../../CipherSqlStudio-assignment.json'));
      fallbackAssignments = data.map((a, i) => ({
        _id: `fallback_${i}`,
        ...a,
      }));
    } catch (e) {
      fallbackAssignments = [];
    }
  }
  return fallbackAssignments;
};

/**
 * GET /api/assignments
 * Fetch all assignments (listing page)
 */
const getAssignments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // MongoDB not connected — use fallback JSON data
      const data = getFallbackAssignments().map(a => ({
        _id: a._id,
        title: a.title,
        description: a.description,
        question: a.question,
        createdAt: a.createdAt,
      }));
      return res.json({ success: true, data });
    }

    const assignments = await Assignment.find()
      .select('title description question createdAt')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    // Fallback on error
    const data = getFallbackAssignments().map(a => ({
      _id: a._id,
      title: a.title,
      description: a.description,
      question: a.question,
      createdAt: a.createdAt,
    }));
    res.json({ success: true, data });
  }
};

/**
 * GET /api/assignments/:id
 * Fetch a single assignment with full details
 */
const getAssignmentById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const assignment = getFallbackAssignments().find(a => a._id === req.params.id);
      if (!assignment) {
        return res.status(404).json({ success: false, error: 'Assignment not found' });
      }
      return res.json({ success: true, data: assignment });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    // Try fallback
    const assignment = getFallbackAssignments().find(a => a._id === req.params.id);
    if (assignment) {
      return res.json({ success: true, data: assignment });
    }
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
};

module.exports = { getAssignments, getAssignmentById };
