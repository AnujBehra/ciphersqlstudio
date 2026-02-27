const { executeQuery } = require('../services/queryService');
const Assignment = require('../models/Assignment');
const UserProgress = require('../models/UserProgress');

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
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    // Execute the query
    const result = await executeQuery(assignmentId, sqlQuery);

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
