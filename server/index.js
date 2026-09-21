import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

// In-memory cache for serverless environments (e.g. Vercel)
let inMemoryNotes = null;

// Helper to read notes
function readNotes() {
  if (inMemoryNotes) return inMemoryNotes;
  try {
    if (!fs.existsSync(DATA_FILE)) {
      inMemoryNotes = [];
      return inMemoryNotes;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    inMemoryNotes = JSON.parse(data);
    return inMemoryNotes;
  } catch (err) {
    console.error('Error reading notes.json:', err);
    inMemoryNotes = [];
    return inMemoryNotes;
  }
}

// Helper to write notes
function writeNotes(notes) {
  inMemoryNotes = notes;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
  } catch (err) {
    // Vercel serverless environment has read-only filesystem, gracefully fall back to memory
    console.warn('File write skipped (serverless read-only storage):', err.message);
  }
}

// Postmark generators
const POSTMARKS = [
  'MIDNIGHT TELEGRAPH • DESK 4',
  'OLD TOWN POSTAL VAULT • #7',
  'CENTRAL MAIL DISPATCH • ROUTE 12',
  'AIRMAIL EXPRESS • PIGEON SEAL',
  'SEASIDE POSTAL ROOM • HARBOR 3',
  'SUBURBAN OUTPOST • BOX 804'
];

// Helper to sanitize note (hide password and mask private content for list view)
function sanitizeNote(note) {
  if (!note) return null;
  const copy = { ...note };
  delete copy.password;
  if (copy.isPrivate) {
    copy.content = '🔒 Private Secret Note (Password Protected)';
  }
  return copy;
}

// GET /api/notes - search, filter, sort
app.get('/api/notes', (req, res) => {
  let notes = readNotes();
  const { search, tag, sort } = req.query;

  const hasSearch = search && search.trim() !== '';

  if (hasSearch) {
    // Search by recipient name, title, or sender
    const query = search.trim().toLowerCase();
    notes = notes.filter(n =>
      (n.recipient && n.recipient.toLowerCase().includes(query)) ||
      (n.title && n.title.toLowerCase().includes(query)) ||
      (n.sender && n.sender.toLowerCase().includes(query)) ||
      (!n.isPrivate && n.content && n.content.toLowerCase().includes(query))
    );
  } else {
    // PUBLIC POSTAL SHELF (No search query) -> Exclude private messages from general browsing
    notes = notes.filter(n => !n.isPrivate);
  }

  // Filter by tag
  if (tag && tag.trim() !== '' && tag !== 'All') {
    notes = notes.filter(n => n.tag && n.tag.toLowerCase() === tag.trim().toLowerCase());
  }

  // Sort
  if (sort === 'popular') {
    notes.sort((a, b) => {
      const sumA = Object.values(a.reactions || {}).reduce((x, y) => x + y, 0);
      const sumB = Object.values(b.reactions || {}).reduce((x, y) => x + y, 0);
      return sumB - sumA;
    });
  } else {
    // Default: recent first
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(notes.map(sanitizeNote));
});

// GET /api/notes/random - Get random public note
app.get('/api/notes/random', (req, res) => {
  const notes = readNotes();
  const publicNotes = notes.filter(n => !n.isPrivate);
  if (publicNotes.length === 0) {
    return res.status(404).json({ error: 'No public notes found' });
  }
  const randomIndex = Math.floor(Math.random() * publicNotes.length);
  res.json(sanitizeNote(publicNotes[randomIndex]));
});

// GET /api/notes/:id - Get single note
app.get('/api/notes/:id', (req, res) => {
  const notes = readNotes();
  const note = notes.find(n => n.id === req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(sanitizeNote(note));
});

// POST /api/notes - Create new note
app.post('/api/notes', (req, res) => {
  const {
    recipient,
    sender,
    title,
    content,
    paperTheme,
    fontFamily,
    inkColor,
    stampDesign,
    waxSeal,
    tag,
    isPrivate,
    password,
    imageUrl,
    voiceUrl
  } = req.body;

  if (!recipient || !recipient.trim() || !content || !content.trim()) {
    return res.status(400).json({ error: 'Recipient and Content are required fields.' });
  }

  if (isPrivate && (!password || !password.trim())) {
    return res.status(400).json({ error: 'A passcode is required to make a note private.' });
  }

  const notes = readNotes();
  const newNote = {
    id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient: recipient.trim(),
    sender: (sender && sender.trim()) || 'Anonymous',
    title: (title && title.trim()) || `A note for ${recipient.trim()}`,
    content: content.trim(),
    paperTheme: paperTheme || 'tea-stained',
    fontFamily: fontFamily || 'caveat',
    inkColor: inkColor || 'sepia',
    stampDesign: stampDesign || 'botanical-rose',
    waxSeal: waxSeal || 'ruby-red',
    tag: tag || 'Unsaid Words',
    isPrivate: Boolean(isPrivate),
    password: isPrivate ? String(password).trim() : '',
    imageUrl: imageUrl || '',
    voiceUrl: voiceUrl || '',
    reactions: { heart: 0, hug: 0, star: 0, stamp: 1 },
    createdAt: new Date().toISOString(),
    postmarkLocation: POSTMARKS[Math.floor(Math.random() * POSTMARKS.length)]
  };

  notes.unshift(newNote);
  writeNotes(notes);

  res.status(201).json(sanitizeNote(newNote));
});

// POST /api/notes/:id/unlock - Unlock a private note with passcode
app.post('/api/notes/:id/unlock', (req, res) => {
  const { password } = req.body;
  const notes = readNotes();
  const note = notes.find(n => n.id === req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (!note.isPrivate) {
    return res.json(sanitizeNote(note));
  }

  if (note.password && String(password || '').trim() === note.password) {
    const unlockedNote = { ...note };
    delete unlockedNote.password;
    return res.json(unlockedNote);
  } else {
    return res.status(401).json({ error: 'Incorrect passcode. The secret letter remains sealed.' });
  }
});

// POST /api/notes/:id/react - React to note
app.post('/api/notes/:id/react', (req, res) => {
  const { reactionType } = req.body; // 'heart', 'hug', 'star', 'stamp'
  const validReactions = ['heart', 'hug', 'star', 'stamp'];

  if (!reactionType || !validReactions.includes(reactionType)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }

  const notes = readNotes();
  const noteIndex = notes.findIndex(n => n.id === req.params.id);

  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (!notes[noteIndex].reactions) {
    notes[noteIndex].reactions = { heart: 0, hug: 0, star: 0, stamp: 0 };
  }

  notes[noteIndex].reactions[reactionType] = (notes[noteIndex].reactions[reactionType] || 0) + 1;
  writeNotes(notes);

  res.json(sanitizeNote(notes[noteIndex]));
});

// GET /api/stats - Global post office stats
app.get('/api/stats', (req, res) => {
  const notes = readNotes();
  const totalNotes = notes.length;
  const uniqueRecipients = new Set(notes.map(n => n.recipient.trim().toLowerCase())).size;
  const totalReactions = notes.reduce((acc, note) => {
    return acc + Object.values(note.reactions || {}).reduce((x, y) => x + y, 0);
  }, 0);

  res.json({
    totalNotes,
    uniqueRecipients,
    totalReactions
  });
});

// GET /api/names/popular - Get top addressed recipient names (excluding private notes)
app.get('/api/names/popular', (req, res) => {
  const notes = readNotes();
  const publicNotes = notes.filter(n => !n.isPrivate);
  const counts = {};
  publicNotes.forEach(n => {
    const name = n.recipient.trim();
    if (name) {
      counts[name] = (counts[name] || 0) + 1;
    }
  });

  const popular = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  res.json(popular);
});

// Only listen locally if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`📬 The Unsaid Backend running on port ${PORT}`);
  });
}

export default app;
