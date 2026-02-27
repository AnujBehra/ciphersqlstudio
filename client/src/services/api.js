const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Base fetch wrapper with error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// ─── Assignment API ──────────────────────────────────────

export const getAssignments = () => apiFetch('/assignments');

export const getAssignmentById = (id) => apiFetch(`/assignments/${id}`);

// ─── Query Execution API ─────────────────────────────────

export const executeQuery = (assignmentId, sqlQuery) =>
  apiFetch('/query/execute', {
    method: 'POST',
    body: JSON.stringify({ assignmentId, sqlQuery }),
  });

// ─── Hint API ────────────────────────────────────────────

export const getHint = (assignmentId, userQuery) =>
  apiFetch('/hint', {
    method: 'POST',
    body: JSON.stringify({ assignmentId, userQuery }),
  });

// ─── Auth API ────────────────────────────────────────────

export const signup = (name, email, password) =>
  apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email, password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiFetch('/auth/me');
