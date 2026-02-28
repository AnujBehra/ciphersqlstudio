const initSqlJs = require('sql.js/dist/sql-asm.js');
const path = require('path');

let SQL = null;

/**
 * Initialize sql.js (SQLite compiled to WASM/JS)
 */
const initSQL = async () => {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
};

/**
 * Execute a SQL query against in-memory SQLite with assignment data.
 * This is a fallback when PostgreSQL is not available (e.g. Vercel deployment).
 */
const executeQueryFallback = async (assignment, sqlQuery) => {
  // Basic validation — only allow SELECT/WITH
  const trimmed = sqlQuery.trim().replace(/;+$/, '').trim();
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
    return { success: false, error: 'Only SELECT queries are allowed.' };
  }

  const sql = await initSQL();
  const db = new sql.Database();

  try {
    // Create tables and insert data from the assignment's sampleTables
    for (const table of assignment.sampleTables) {
      const { tableName, columns, rows } = table;

      // Build CREATE TABLE
      const colDefs = columns.map(col => {
        let sqliteType;
        switch (col.dataType.toUpperCase()) {
          case 'INTEGER': sqliteType = 'INTEGER'; break;
          case 'REAL': sqliteType = 'REAL'; break;
          case 'TEXT': sqliteType = 'TEXT'; break;
          default: sqliteType = 'TEXT';
        }
        return `${col.columnName} ${sqliteType}`;
      }).join(', ');

      db.run(`CREATE TABLE ${tableName} (${colDefs})`);

      // Insert rows
      if (rows.length > 0) {
        const colNames = columns.map(c => c.columnName);
        const placeholders = colNames.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO ${tableName} (${colNames.join(', ')}) VALUES (${placeholders})`);

        for (const row of rows) {
          const values = colNames.map(c => row[c] !== undefined ? row[c] : null);
          stmt.run(values);
        }
        stmt.free();
      }
    }

    // Execute the user's query
    const results = db.exec(sqlQuery);

    if (results.length === 0) {
      return {
        success: true,
        data: {
          rows: [],
          fields: [],
          rowCount: 0,
        },
      };
    }

    const result = results[0];
    const fields = result.columns;
    const rows = result.values.map(row => {
      const obj = {};
      fields.forEach((f, i) => { obj[f] = row[i]; });
      return obj;
    });

    return {
      success: true,
      data: {
        rows,
        fields,
        rowCount: rows.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    db.close();
  }
};

module.exports = { executeQueryFallback };
