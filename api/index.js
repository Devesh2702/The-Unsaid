import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initial seed notes array for Vercel serverless functions
const INITIAL_NOTES = [];

// In-memory notes state for serverless execution
let notesDatabase = [];

// Postmark generators
const POSTMARKS = [
  'MIDNIGHT TELEGRAPH • DESK 4',
  'OLD TOWN POSTAL VAULT • #7',
  'CENTRAL MAIL DISPATCH • ROUTE 12',
  'AIRMAIL EXPRESS • PIGEON SEAL',
  'SEASIDE POSTAL ROOM • HARBOR 3',
  'SUBURBAN OUTPOST • BOX 804'
];

function sanitizeNote(note) {
  if (!note) return null;
  const copy = { ...note };
  delete copy.password;
  if (copy.isPrivate) {
    copy.content = '🔒 Private Secret Note (Password Protected)';
  }
  return copy;
}

const router = express.Router();

// GET / or /api (Health Check)
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: '📬 Online Post Office API is operational!' });
});

// GET /notes or /api/notes
router.get('/notes', (req, res) => {
  try {
    let notes = [...notesDatabase];
    const { search, tag, sort } = req.query;

    const hasSearch = search && search.trim() !== '';

    if (hasSearch) {
      const query = search.trim().toLowerCase();
      notes = notes.filter(n =>
        (n.recipient && n.recipient.toLowerCase().includes(query)) ||
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.sender && n.sender.toLowerCase().includes(query)) ||
        (!n.isPrivate && n.content && n.content.toLowerCase().includes(query))
      );
    } else {
      notes = notes.filter(n => !n.isPrivate);
    }

    if (tag && tag.trim() !== '' && tag !== 'All') {
      notes = notes.filter(n => n.tag && n.tag.toLowerCase() === tag.trim().toLowerCase());
    }

    if (sort === 'popular') {
      notes.sort((a, b) => {
        const sumA = Object.values(a.reactions || {}).reduce((x, y) => x + y, 0);
        const sumB = Object.values(b.reactions || {}).reduce((x, y) => x + y, 0);
        return sumB - sumA;
      });
    } else {
      notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(notes.map(sanitizeNote));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching notes' });
  }
});

// GET /notes/random
router.get('/notes/random', (req, res) => {
  try {
    const publicNotes = notesDatabase.filter(n => !n.isPrivate);
    if (publicNotes.length === 0) {
      return res.status(404).json({ error: 'No public notes found' });
    }
    const randomIndex = Math.floor(Math.random() * publicNotes.length);
    res.json(sanitizeNote(publicNotes[randomIndex]));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching random note' });
  }
});

// GET /notes/:id
router.get('/notes/:id', (req, res) => {
  try {
    const note = notesDatabase.find(n => n.id === req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(sanitizeNote(note));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching note' });
  }
});

// POST /notes
router.post('/notes', (req, res) => {
  try {
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
    } = req.body || {};

    if (!recipient || !recipient.trim() || !content || !content.trim()) {
      return res.status(400).json({ error: 'Recipient Name and Message Content are required.' });
    }

    if (isPrivate && (!password || !password.trim())) {
      return res.status(400).json({ error: 'A passcode is required for private notes.' });
    }

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

    notesDatabase.unshift(newNote);
    res.status(201).json(sanitizeNote(newNote));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error creating note' });
  }
});

// POST /notes/:id/unlock
router.post('/notes/:id/unlock', (req, res) => {
  try {
    const { password } = req.body || {};
    const note = notesDatabase.find(n => n.id === req.params.id);

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
      return res.status(401).json({ error: 'Incorrect passcode. Secret note remains locked.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error unlocking note' });
  }
});

// POST /notes/:id/react
router.post('/notes/:id/react', (req, res) => {
  try {
    const { reactionType } = req.body || {};
    const validReactions = ['heart', 'hug', 'star', 'stamp'];

    if (!reactionType || !validReactions.includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const noteIndex = notesDatabase.findIndex(n => n.id === req.params.id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (!notesDatabase[noteIndex].reactions) {
      notesDatabase[noteIndex].reactions = { heart: 0, hug: 0, star: 0, stamp: 0 };
    }

    notesDatabase[noteIndex].reactions[reactionType] = (notesDatabase[noteIndex].reactions[reactionType] || 0) + 1;
    res.json(sanitizeNote(notesDatabase[noteIndex]));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error updating reaction' });
  }
});

// GET /stats
router.get('/stats', (req, res) => {
  try {
    const totalNotes = notesDatabase.length;
    const uniqueRecipients = new Set(notesDatabase.map(n => n.recipient.trim().toLowerCase())).size;
    const totalReactions = notesDatabase.reduce((acc, note) => {
      return acc + Object.values(note.reactions || {}).reduce((x, y) => x + y, 0);
    }, 0);

    res.json({
      totalNotes,
      uniqueRecipients,
      totalReactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching stats' });
  }
});

// GET /names/popular
router.get('/names/popular', (req, res) => {
  try {
    const publicNotes = notesDatabase.filter(n => !n.isPrivate);
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
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching popular names' });
  }
});

// Middleware to normalize Vercel serverless request pathing
app.use((req, res, next) => {
  if (req.url && req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }
  next();
});

app.use('/api', router);
app.use('/', router);

app.use((err, req, res, next) => {
  console.error('Serverless Error:', err);
  res.status(500).json({ error: err.message || 'Server error occurred' });
});

export default app;
