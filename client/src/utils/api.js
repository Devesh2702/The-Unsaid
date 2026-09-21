// API Client for Online Post Office Backend

const BASE_URL = '/api';

// Safe helper to parse JSON response or handle plain text server errors gracefully
async function parseJsonResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.warn('Non-JSON response from server:', text);
    data = { error: text || `Server error (${res.status})` };
  }

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export async function fetchNotes({ search = '', tag = 'All', sort = 'recent' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag && tag !== 'All') params.append('tag', tag);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${BASE_URL}/notes?${params.toString()}`);
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('fetchNotes error:', err);
    return [];
  }
}

export async function fetchRandomNote() {
  try {
    const res = await fetch(`${BASE_URL}/notes/random`);
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('fetchRandomNote error:', err);
    return null;
  }
}

export async function createNote(noteData) {
  try {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('createNote error:', err);
    throw err;
  }
}

export async function unlockNote(noteId, password) {
  try {
    const res = await fetch(`${BASE_URL}/notes/${noteId}/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('unlockNote error:', err);
    throw err;
  }
}

export async function reactToNote(noteId, reactionType) {
  try {
    const res = await fetch(`${BASE_URL}/notes/${noteId}/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reactionType }),
    });
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('reactToNote error:', err);
    return null;
  }
}

export async function fetchPostOfficeStats() {
  try {
    const res = await fetch(`${BASE_URL}/stats`);
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('fetchPostOfficeStats error:', err);
    return { totalNotes: 0, uniqueRecipients: 0, totalReactions: 0 };
  }
}

export async function fetchPopularNames() {
  try {
    const res = await fetch(`${BASE_URL}/names/popular`);
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('fetchPopularNames error:', err);
    return [];
  }
}
