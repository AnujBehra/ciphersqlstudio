const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const path = require('path');
const Assignment = require('../models/Assignment');
const { pool } = require('../config/postgres');
const { setupAssignmentSchema } = require('../services/queryService');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test PostgreSQL connection
    const pgClient = await pool.connect();
    console.log('Connected to PostgreSQL');
    pgClient.release();

    // Load assignment data
    const assignmentData = require(path.join(__dirname, '../../CipherSqlStudio-assignment.json'));
    console.log(`Found ${assignmentData.length} assignments to seed`);

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('Cleared existing assignments');

    // Insert assignments into MongoDB and setup PostgreSQL schemas
    for (const data of assignmentData) {
      const assignment = await Assignment.create({
        title: data.title,
        description: data.description,
        question: data.question,
        sampleTables: data.sampleTables,
        expectedOutput: data.expectedOutput,
      });

      console.log(`Created assignment: ${assignment.title} (${assignment._id})`);

      // Setup PostgreSQL schema with sample tables
      await setupAssignmentSchema(assignment._id.toString(), data.sampleTables);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`   - ${assignmentData.length} assignments inserted into MongoDB`);
    console.log(`   - ${assignmentData.length} schemas created in PostgreSQL`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
