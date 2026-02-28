const { executeQuery } = require('../services/queryService');
const { executeQueryFallback } = require('../services/queryServiceFallback');
const Assignment = require('../models/Assignment');
const UserProgress = require('../models/UserProgress');
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
 * POST /api/query/execute
 * Execute a SQL query against the assignment's sandbox
 */
const runQuery = async (req, res) => {
  try {
    const { assignmentId, sqlQuery } = req.body;

    if (!assignmentId || !sqlQuery) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID and SQL query are required.',
      });
    }

    // Verify assignment exists
    let assignment;
    if (mongoose.connection.readyState === 1) {
      assignment = await Assignment.findById(assignmentId);
    }
    if (!assignment) {
      // Try fallback
      assignment = getFallbackAssignment(assignmentId);
    }
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    // Execute the query — use PostgreSQL if available, otherwise SQLite fallback
    let result;
    try {
      const { pool } = require('../config/postgres');
      const client = await pool.connect();
      client.release();
      // PostgreSQL is available
      result = await executeQuery(assignmentId, sqlQuery);
    } catch (pgError) {
      // PostgreSQL not available — use SQLite fallback
      result = await executeQueryFallback(assignment, sqlQuery);
    }

    // Save progress (optional feature)
    try {
      const userId = req.user?.id || null;
      const sessionId = req.headers['x-session-id'] || null;

      if (userId || sessionId) {
        const filter = userId
          ? { userId, assignmentId }
          : { sessionId, assignmentId };

        await UserProgress.findOneAndUpdate(
          filter,
          {
            sqlQuery,
            lastAttempt: new Date(),
            $inc: { attemptCount: 1 },
            isCompleted: result.success,
          },
          { upsert: true, new: true }
        );
      }
    } catch (progressError) {
      console.error('Error saving progress:', progressError.message);
      // Don't fail the query execution if progress saving fails
    }

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

module.exports = { runQuery };
