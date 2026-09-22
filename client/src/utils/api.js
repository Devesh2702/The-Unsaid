// API Client for Online Post Office Backend with LocalStorage Backup & Fallback

const BASE_URL = '/api';
const LOCAL_NOTES_KEY = 'postoffice_local_notes';

export const DEFAULT_SEED_NOTES = [
  {
    id: 'note-seed-1',
    recipient: 'Stranger in Row 12',
    sender: 'Quiet Reader',
    title: 'The Fallen Flower Bookmark',
    content: 'You were reading Rilke on the morning train. When you got off at the central station, your dried wildflower bookmark slipped from your book. I am keeping it safe for you.',
    paperTheme: 'tea-stained',
    fontFamily: 'caveat',
    inkColor: 'sepia',
    stampDesign: 'botanical-rose',
    waxSeal: 'ruby-red',
    tag: 'Unsaid Words',
    isPrivate: false,
    reactions: { heart: 12, hug: 5, star: 8, stamp: 14 },
    createdAt: '2026-09-20T14:30:00.000Z',
    postmarkLocation: 'MIDNIGHT TELEGRAPH • DESK 4'
  },
  {
    id: 'note-seed-2',
    recipient: 'Maya',
    sender: 'Leo',
    title: 'Rainy Afternoon Coffee',
    content: 'Thank you for listening yesterday when everything felt overwhelming. That cinnamon latte tasted like quiet comfort, and your kindness meant more than you know.',
    paperTheme: 'rose-velvet',
    fontFamily: 'dancing-script',
    inkColor: 'crimson',
    stampDesign: 'botanical-rose',
    waxSeal: 'ruby-red',
    tag: 'Gratitude',
    isPrivate: false,
    reactions: { heart: 24, hug: 18, star: 9, stamp: 20 },
    createdAt: '2026-09-21T09:15:00.000Z',
    postmarkLocation: 'OLD TOWN POSTAL VAULT • #7'
  },
  {
    id: 'note-seed-3',
    recipient: 'Future Self',
    sender: 'Me in 2026',
    title: 'A Reminder to Breathe',
    content: "I hope you survived all the difficult moments you thought would break you. Don't forget where you came from, and remember to look at the stars tonight.",
    paperTheme: 'midnight-ink',
    fontFamily: 'sacramento',
    inkColor: 'midnight',
    stampDesign: 'starlight',
    waxSeal: 'royal-violet',
    tag: 'Nostalgia',
    isPrivate: false,
    reactions: { heart: 35, hug: 12, star: 42, stamp: 30 },
    createdAt: '2026-09-21T18:45:00.000Z',
    postmarkLocation: 'CENTRAL MAIL DISPATCH • ROUTE 12'
  },
  {
    id: 'note-seed-4',
    recipient: 'Grandpa Arthur',
    sender: 'Ellie',
    title: 'The Old Radio is Still Playing',
    content: 'Every time jazz music plays on the radio, I close my eyes and remember sitting on your porch listening to the summer crickets. Missing you always.',
    paperTheme: 'classic-parchment',
    fontFamily: 'patrick-hand',
    inkColor: 'sepia',
    stampDesign: 'vintage-clock',
    waxSeal: 'antique-gold',
    tag: 'Nostalgia',
    isPrivate: false,
    reactions: { heart: 45, hug: 30, star: 28, stamp: 50 },
    createdAt: '2026-09-22T08:00:00.000Z',
    postmarkLocation: 'SUBURBAN OUTPOST • BOX 804'
  }
];

// Helper to safely fetch local notes from browser storage
export function getLocalNotes() {
  try {
    const raw = localStorage.getItem(LOCAL_NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [...DEFAULT_SEED_NOTES];
  } catch (err) {
    console.warn('Failed to read notes from localStorage:', err);
    return [...DEFAULT_SEED_NOTES];
  }
}

// Helper to save a single note into localStorage
export function saveLocalNote(note) {
  if (!note || !note.id) return;
  try {
    const existing = getLocalNotes();
    const filtered = existing.filter(n => n.id !== note.id);
    const updated = [note, ...filtered];
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save note to localStorage:', err);
  }
}

// Helper to sync server notes with local storage
export function syncLocalNotes(serverNotes) {
  if (!Array.isArray(serverNotes)) return;
  try {
    const local = getLocalNotes();
    const localMap = new Map();
    local.forEach(n => {
      if (n && n.id) localMap.set(n.id, n);
    });

    const merged = serverNotes.map(serverNote => {
      if (!serverNote || !serverNote.id) return serverNote;
      const existingLocal = localMap.get(serverNote.id);
      if (existingLocal) {
        return {
          ...serverNote,
          rawContent: existingLocal.rawContent || serverNote.rawContent,
          password: existingLocal.password || serverNote.password,
          isUnlocked: existingLocal.isUnlocked || false,
          content: existingLocal.isUnlocked && existingLocal.rawContent ? existingLocal.rawContent : serverNote.content,
          imageUrl: existingLocal.isUnlocked && existingLocal.imageUrl ? existingLocal.imageUrl : (serverNote.imageUrl || existingLocal.imageUrl),
          voiceUrl: existingLocal.isUnlocked && existingLocal.voiceUrl ? existingLocal.voiceUrl : (serverNote.voiceUrl || existingLocal.voiceUrl),
        };
      }
      return serverNote;
    });

    // Merge any offline created notes not yet on the server
    local.forEach(n => {
      if (n && n.id && !merged.some(m => m.id === n.id)) {
        merged.push(n);
      }
    });

    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Failed to sync notes with localStorage:', err);
  }
}

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
  let serverNotes = [];
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag && tag !== 'All') params.append('tag', tag);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${BASE_URL}/notes?${params.toString()}`);
    serverNotes = await parseJsonResponse(res);
    if (Array.isArray(serverNotes) && serverNotes.length > 0) {
      syncLocalNotes(serverNotes);
    }
  } catch (err) {
    console.warn('fetchNotes API request failed, using cached local notes:', err);
  }

  // Retrieve merged list (server + user created local notes)
  let allNotes = getLocalNotes();

  // If local notes empty, use whatever server returned
  if (allNotes.length === 0 && Array.isArray(serverNotes)) {
    allNotes = serverNotes;
  }

  // Apply client-side search, tag, and sort filters to guarantee consistency
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    allNotes = allNotes.filter(n =>
      (n.recipient && n.recipient.toLowerCase().includes(q)) ||
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.sender && n.sender.toLowerCase().includes(q)) ||
      (!n.isPrivate && n.content && n.content.toLowerCase().includes(q))
    );
  }

  if (tag && tag.trim() !== '' && tag !== 'All') {
    allNotes = allNotes.filter(n => n.tag && n.tag.toLowerCase() === tag.trim().toLowerCase());
  }

  if (sort === 'popular') {
    allNotes.sort((a, b) => {
      const sumA = Object.values(a.reactions || {}).reduce((x, y) => x + y, 0);
      const sumB = Object.values(b.reactions || {}).reduce((x, y) => x + y, 0);
      return sumB - sumA;
    });
  } else {
    allNotes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return allNotes;
}

export async function fetchRandomNote() {
  try {
    const res = await fetch(`${BASE_URL}/notes/random`);
    return await parseJsonResponse(res);
  } catch (err) {
    console.warn('fetchRandomNote server error, selecting from local cache:', err);
    const local = getLocalNotes().filter(n => !n.isPrivate);
    if (local.length === 0) return null;
    const idx = Math.floor(Math.random() * local.length);
    return local[idx];
  }
}

export async function createNote(noteData) {
  let createdNote = null;
  const isPrivate = Boolean(noteData.isPrivate);
  const rawPassword = isPrivate ? String(noteData.password || '').trim() : '';
  const rawContent = String(noteData.content || '').trim();

  try {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    createdNote = await parseJsonResponse(res);
  } catch (err) {
    console.warn('createNote server failed, saving locally:', err);
    // Create an offline fallback note object
    createdNote = {
      id: `note-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient: noteData.recipient ? noteData.recipient.trim() : '',
      sender: noteData.sender ? noteData.sender.trim() : 'Anonymous',
      title: noteData.title ? noteData.title.trim() : `A note for ${noteData.recipient}`,
      content: isPrivate ? '🔒 Private Secret Note (Password Protected)' : rawContent,
      paperTheme: noteData.paperTheme || 'tea-stained',
      fontFamily: noteData.fontFamily || 'caveat',
      inkColor: noteData.inkColor || 'sepia',
      stampDesign: noteData.stampDesign || 'botanical-rose',
      waxSeal: noteData.waxSeal || 'ruby-red',
      tag: noteData.tag || 'Unsaid Words',
      isPrivate,
      password: rawPassword,
      imageUrl: noteData.imageUrl || '',
      voiceUrl: noteData.voiceUrl || '',
      reactions: { heart: 0, hug: 0, star: 0, stamp: 1 },
      createdAt: new Date().toISOString(),
      postmarkLocation: 'LOCAL DISPATCH • DESK 1'
    };
  }

  // Always retain rawContent and password in local storage cache for seamless unlocking
  if (createdNote) {
    const noteToSave = {
      ...createdNote,
      rawContent,
      password: rawPassword,
      imageUrl: noteData.imageUrl || createdNote.imageUrl,
      voiceUrl: noteData.voiceUrl || createdNote.voiceUrl
    };
    saveLocalNote(noteToSave);
  }

  return createdNote;
}

export async function unlockNote(noteId, password) {
  const inputPass = String(password || '').trim();
  const localNotes = getLocalNotes();
  const localNote = localNotes.find(n => n.id === noteId || (n._id && String(n._id) === noteId));

  // If localNote has saved password and matches, unlock immediately
  if (localNote && localNote.password && String(localNote.password).trim() === inputPass) {
    const unlocked = {
      ...localNote,
      content: localNote.rawContent || localNote.content,
      isUnlocked: true
    };
    delete unlocked.password;
    saveLocalNote(unlocked);
    return unlocked;
  }

  // Otherwise, attempt server unlock
  let serverError = null;
  try {
    const res = await fetch(`${BASE_URL}/notes/${encodeURIComponent(noteId)}/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: inputPass }),
    });
    const unlockedServerNote = await parseJsonResponse(res);
    if (unlockedServerNote) {
      const cached = {
        ...(localNote || {}),
        ...unlockedServerNote,
        isUnlocked: true
      };
      saveLocalNote(cached);
      return cached;
    }
  } catch (err) {
    serverError = err;
    console.warn('unlockNote server request failed:', err.message);
  }

  // If server explicitly returned passcode failure (401), rethrow that specific message!
  if (serverError && serverError.message && serverError.message.toLowerCase().includes('passcode')) {
    throw serverError;
  }

  // If localNote had password but didn't match
  if (localNote && localNote.password) {
    if (String(localNote.password).trim() !== inputPass) {
      throw new Error('Incorrect passcode. The secret letter remains sealed.');
    }
  }

  // If localNote exists but has no password and server failed
  if (localNote && serverError) {
    throw new Error(serverError.message || 'Unable to unseal note from server. Please check your passcode.');
  }

  // If not found anywhere
  throw new Error(serverError?.message || 'Note not found');
}

export async function reactToNote(noteId, reactionType) {
  let updatedNote = null;
  try {
    const res = await fetch(`${BASE_URL}/notes/${noteId}/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reactionType }),
    });
    updatedNote = await parseJsonResponse(res);
  } catch (err) {
    console.warn('reactToNote server request failed, updating local state:', err);
  }

  // Also update reaction in local storage cache
  const localNotes = getLocalNotes();
  const idx = localNotes.findIndex(n => n.id === noteId);
  if (idx !== -1) {
    if (!localNotes[idx].reactions) {
      localNotes[idx].reactions = { heart: 0, hug: 0, star: 0, stamp: 0 };
    }
    localNotes[idx].reactions[reactionType] = (localNotes[idx].reactions[reactionType] || 0) + 1;
    saveLocalNote(localNotes[idx]);
    if (!updatedNote) {
      updatedNote = localNotes[idx];
    }
  }

  return updatedNote;
}

export async function fetchPostOfficeStats() {
  try {
    const res = await fetch(`${BASE_URL}/stats`);
    const serverStats = await parseJsonResponse(res);
    const local = getLocalNotes();
    const totalNotes = Math.max(serverStats.totalNotes || 0, local.length);
    const uniqueRecipients = new Set(local.map(n => (n.recipient || '').trim().toLowerCase())).size || serverStats.uniqueRecipients;
    const totalReactions = local.reduce((acc, note) => {
      return acc + Object.values(note.reactions || {}).reduce((x, y) => x + y, 0);
    }, 0) || serverStats.totalReactions;

    return { totalNotes, uniqueRecipients, totalReactions };
  } catch (err) {
    console.warn('fetchPostOfficeStats error:', err);
    const local = getLocalNotes();
    const totalNotes = local.length;
    const uniqueRecipients = new Set(local.map(n => (n.recipient || '').trim().toLowerCase())).size;
    const totalReactions = local.reduce((acc, note) => {
      return acc + Object.values(note.reactions || {}).reduce((x, y) => x + y, 0);
    }, 0);
    return { totalNotes, uniqueRecipients, totalReactions };
  }
}

export async function fetchPopularNames() {
  try {
    const res = await fetch(`${BASE_URL}/names/popular`);
    const data = await parseJsonResponse(res);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    console.warn('fetchPopularNames error:', err);
  }

  // Calculate from local cache if backend unavailable or empty
  const local = getLocalNotes().filter(n => !n.isPrivate);
  const counts = {};
  local.forEach(n => {
    const name = (n.recipient || '').trim();
    if (name) counts[name] = (counts[name] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
}
