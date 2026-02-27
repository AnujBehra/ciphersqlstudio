const { pool } = require('../config/postgres');

// Dangerous SQL keywords that should not be allowed in user queries
const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE',
  'GRANT', 'REVOKE', 'COPY', 'EXECUTE', 'EXEC', 'INTO',
  'SET ', 'LOCK', 'UNLISTEN', 'LISTEN', 'NOTIFY', 'VACUUM',
  'REINDEX', 'CLUSTER', 'COMMENT', 'SECURITY',
];

/**
 * Validate a SQL query to ensure it's a safe SELECT query.
 */
const validateQuery = (query) => {
  const trimmed = query.trim().replace(/;+$/, '').trim();

  if (!trimmed) {
    return { valid: false, error: 'Query cannot be empty.' };
  }

  // Must start with SELECT or WITH (for CTEs)
  const upperQuery = trimmed.toUpperCase();
  if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('WITH')) {
    return { valid: false, error: 'Only SELECT queries are allowed.' };
  }

  // Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    // Use word boundary check to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(trimmed)) {
      // Allow "INTO" only if it's part of SELECT ... INTO is also blocked
      return { valid: false, error: `Forbidden keyword detected: ${keyword.trim()}. Only read-only queries are allowed.` };
    }
  }

  // Check for multiple statements (semicolon in middle)
  const withoutStrings = trimmed.replace(/'[^']*'/g, '');
  if (withoutStrings.includes(';')) {
    return { valid: false, error: 'Multiple statements are not allowed.' };
  }

  return { valid: true };
};

/**
 * Execute a SQL query within an isolated schema for a given assignment.
 * Uses a read-only transaction with rollback for safety.
 */
const executeQuery = async (assignmentId, sqlQuery) => {
  const validation = validateQuery(sqlQuery);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const schemaName = `assignment_${assignmentId}`;
  const client = await pool.connect();

  try {
    // Start a read-only transaction
    await client.query('BEGIN READ ONLY');

    // Set the search path to the assignment's schema
    await client.query(`SET search_path TO ${schemaName}, public`);

    // Execute the user's query with a timeout
    await client.query('SET statement_timeout = 5000'); // 5 second timeout

    const result = await client.query(sqlQuery);

    // Rollback (since it's read-only, nothing to commit)
    await client.query('ROLLBACK');

    return {
      success: true,
      data: {
        rows: result.rows,
        fields: result.fields.map(f => f.name),
        rowCount: result.rowCount,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // Reset search path and release
    await client.query('SET search_path TO public').catch(() => {});
    await client.query('RESET statement_timeout').catch(() => {});
    client.release();
  }
};

/**
 * Setup PostgreSQL schema and tables for an assignment.
 */
const setupAssignmentSchema = async (assignmentId, sampleTables) => {
  const schemaName = `assignment_${assignmentId}`;
  const client = await pool.connect();

  try {
    // Create schema if not exists
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    await client.query(`SET search_path TO ${schemaName}`);

    for (const table of sampleTables) {
      const { tableName, columns, rows } = table;

      // Drop table if exists (for re-seeding)
      await client.query(`DROP TABLE IF EXISTS ${schemaName}.${tableName} CASCADE`);

      // Build CREATE TABLE statement
      const colDefs = columns.map(col => {
        let pgType;
        switch (col.dataType.toUpperCase()) {
          case 'INTEGER': pgType = 'INTEGER'; break;
          case 'REAL': pgType = 'REAL'; break;
          case 'TEXT': pgType = 'TEXT'; break;
          case 'BOOLEAN': pgType = 'BOOLEAN'; break;
          case 'DATE': pgType = 'DATE'; break;
          default: pgType = 'TEXT';
        }
        return `${col.columnName} ${pgType}`;
      }).join(', ');

      await client.query(`CREATE TABLE ${schemaName}.${tableName} (${colDefs})`);

      // Insert rows
      if (rows && rows.length > 0) {
        const colNames = columns.map(c => c.columnName);

        for (const row of rows) {
          const values = colNames.map((col, i) => `$${i + 1}`);
          const params = colNames.map(col => row[col]);

          await client.query(
            `INSERT INTO ${schemaName}.${tableName} (${colNames.join(', ')}) VALUES (${values.join(', ')})`,
            params
          );
        }
      }
    }

    console.log(`Schema ${schemaName} setup complete`);
  } catch (error) {
    console.error(`Error setting up schema ${schemaName}:`, error.message);
    throw error;
  } finally {
    await client.query('SET search_path TO public').catch(() => {});
    client.release();
  }
};

module.exports = { executeQuery, validateQuery, setupAssignmentSchema };
