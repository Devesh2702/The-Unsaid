// API Client for Online Post Office Backend

const BASE_URL = '/api';

export async function fetchNotes({ search = '', tag = 'All', sort = 'recent' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag && tag !== 'All') params.append('tag', tag);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${BASE_URL}/notes?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return await res.json();
  } catch (err) {
    console.error('fetchNotes error:', err);
    return [];
  }
}

export async function fetchRandomNote() {
  try {
    const res = await fetch(`${BASE_URL}/notes/random`);
    if (!res.ok) throw new Error('Failed to fetch random note');
    return await res.json();
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
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to dispatch note');
    }
    return await res.json();
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
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Incorrect passcode');
    }
    return await res.json();
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
    if (!res.ok) throw new Error('Failed to add reaction');
    return await res.json();
  } catch (err) {
    console.error('reactToNote error:', err);
    return null;
  }
}

export async function fetchPostOfficeStats() {
  try {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (err) {
    console.error('fetchPostOfficeStats error:', err);
    return { totalNotes: 0, uniqueRecipients: 0, totalReactions: 0 };
  }
}

export async function fetchPopularNames() {
  try {
    const res = await fetch(`${BASE_URL}/names/popular`);
    if (!res.ok) throw new Error('Failed to fetch popular names');
    return await res.json();
  } catch (err) {
    console.error('fetchPopularNames error:', err);
    return [];
  }
}
