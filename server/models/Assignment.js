const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  columnName: { type: String, required: true },
  dataType: { type: String, required: true },
}, { _id: false });

const tableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [columnSchema],
  rows: [mongoose.Schema.Types.Mixed],
}, { _id: false });

const expectedOutputSchema = new mongoose.Schema({
  type: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // "Easy", "Medium", "Hard"
  question: { type: String, required: true },
  sampleTables: [tableSchema],
  expectedOutput: expectedOutputSchema,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);
