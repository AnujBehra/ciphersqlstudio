/**
 * LLM Hint Service - Integrates with Google Gemini API
 * Provides helpful hints without revealing full solutions.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a hint for a SQL assignment using Google Gemini.
 */
const generateHint = async (assignment, userQuery) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'LLM API key not configured. Please set GEMINI_API_KEY in your environment.',
    };
  }

  // Build table context for the prompt
  const tableContext = assignment.sampleTables.map(table => {
    const cols = table.columns.map(c => `${c.columnName} (${c.dataType})`).join(', ');
    return `Table: ${table.tableName} — Columns: ${cols}`;
  }).join('\n');

  // Carefully engineered prompt to get hints, not solutions
  const prompt = `You are a SQL teaching assistant for a learning platform called CipherSQLStudio. 
A student is working on a SQL assignment and needs a hint.

IMPORTANT RULES:
- NEVER provide the complete SQL query or solution
- Give only conceptual hints and guidance
- Suggest which SQL clauses or functions might be useful
- Point the student in the right direction without solving it for them
- Keep hints concise (2-3 sentences max)
- If the student has written a partial query, hint at what might be wrong or missing

ASSIGNMENT DETAILS:
Title: ${assignment.title}
Difficulty: ${assignment.description}
Question: ${assignment.question}

AVAILABLE TABLES:
${tableContext}

${userQuery ? `STUDENT'S CURRENT QUERY:\n${userQuery}` : 'The student has not written any query yet.'}

Provide a helpful hint (NOT the solution):`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const hint = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!hint) {
      throw new Error('No hint generated from LLM');
    }

    return { success: true, hint: hint.trim() };
  } catch (error) {
    console.error('LLM hint generation error:', error.message);
    return {
      success: false,
      error: 'Failed to generate hint. Please try again later.',
    };
  }
};

module.exports = { generateHint };
