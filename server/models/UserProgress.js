const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sqlQuery: { type: String, default: '' },
  lastAttempt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  attemptCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

userProgressSchema.index({ userId: 1, assignmentId: 1 });
userProgressSchema.index({ sessionId: 1, assignmentId: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
