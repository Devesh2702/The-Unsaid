import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB, INITIAL_NOTES } from '../server/db.js';
import Note from '../server/models/Note.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(process.cwd(), 'server', 'data', 'notes.json');
const TMP_DATA_FILE = path.join('/tmp', 'post_office_notes.json');
let notesDatabase = null;

function readNotesFallback() {
  if (notesDatabase && notesDatabase.length > 0) return notesDatabase;

  // 1. Check /tmp (persisted across warm serverless invocations on Vercel)
  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      const data = fs.readFileSync(TMP_DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        notesDatabase = parsed;
        return notesDatabase;
      }
    }
  } catch (err) {
    // ignore
  }

  // 2. Check bundled DATA_FILE
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        notesDatabase = parsed;
        return notesDatabase;
      }
    }
  } catch (err) {
    console.warn('API file read warning:', err.message);
  }

  notesDatabase = [...INITIAL_NOTES];
  return notesDatabase;
}

function writeNotesFallback(notes) {
  notesDatabase = notes;
  // 1. Write to /tmp on Vercel
  try {
    fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
  } catch (err) {
    // ignore
  }

  // 2. Try writing to DATA_FILE locally
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
  } catch (err) {
    // ignore read-only file systems
  }
}

const POSTMARKS = [
  'MIDNIGHT TELEGRAPH • DESK 4',
  'OLD TOWN POSTAL VAULT • #7',
  'CENTRAL MAIL DISPATCH • ROUTE 12',
  'AIRMAIL EXPRESS • PIGEON SEAL',
  'SEASIDE POSTAL ROOM • HARBOR 3',
  'SUBURBAN OUTPOST • BOX 804'
];

// Lightweight pure JS cipher helpers
function hashStr(str) {
  let h1 = 0xdeadbeef ^ 17, h2 = 0x41c6ce57 ^ 17;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function encryptPayload(dataObj, password) {
  try {
    const jsonStr = JSON.stringify(dataObj);
    const pass = String(password || '').trim();
    const salt = Math.random().toString(36).substring(2, 8);
    const verifyHash = hashStr(`${pass}:${salt}:UNSAID_SECRET`);

    let cipherCodes = [];
    for (let i = 0; i < jsonStr.length; i++) {
      const keyChar = hashStr(`${pass}:${salt}:${Math.floor(i / 8)}`);
      const k = keyChar.charCodeAt(i % keyChar.length);
      cipherCodes.push(jsonStr.charCodeAt(i) ^ k);
    }

    const payload = JSON.stringify({
      s: salt,
      h: verifyHash,
      d: cipherCodes
    });

    return Buffer.from(payload).toString('base64');
  } catch (err) {
    return '';
  }
}

function decryptPayload(encryptedStr, password) {
  const pass = String(password || '').trim();
  const raw = Buffer.from(encryptedStr, 'base64').toString('utf8');
  const { s: salt, h: verifyHash, d: cipherCodes } = JSON.parse(raw);

  const expectedHash = hashStr(`${pass}:${salt}:UNSAID_SECRET`);
  if (verifyHash !== expectedHash) {
    throw new Error('Incorrect passcode. The secret letter remains sealed.');
  }

  let plain = '';
  for (let i = 0; i < cipherCodes.length; i++) {
    const keyChar = hashStr(`${pass}:${salt}:${Math.floor(i / 8)}`);
    const k = keyChar.charCodeAt(i % keyChar.length);
    plain += String.fromCharCode(cipherCodes[i] ^ k);
  }

  return JSON.parse(plain);
}

function sanitizeNote(note) {
  if (!note) return null;
  const copy = typeof note.toObject === 'function' ? note.toObject() : { ...note };
  if (!copy.id && copy._id) {
    copy.id = String(copy._id);
  }
  delete copy.password;
  delete copy._id;
  delete copy.__v;
  if (copy.isPrivate) {
    copy.content = '🔒 Private Secret Note (Password Protected)';
    copy.imageUrl = '';
    copy.voiceUrl = '';
    copy.encryptedData = note.encryptedData || copy.encryptedData || '';
  }
  return copy;
}

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', message: '📬 Online Post Office API (MongoDB connected) is operational!' });
});

// Helper to check if tag refers to the Sealed Letters vault
function isSealedLettersTag(t) {
  if (!t) return false;
  const clean = t.replace(/[🔒\s]/g, '').toLowerCase();
  return clean === 'sealedletters' || clean === 'sealedvault';
}

router.get('/notes', async (req, res) => {
  try {
    const isDbConnected = await connectDB();
    const { search, tag, sort } = req.query;
    const hasSearch = search && search.trim() !== '';
    const isVault = isSealedLettersTag(tag);

    if (isDbConnected) {
      let query = {};
      if (isVault) {
        query.isPrivate = true;
        if (hasSearch) {
          const regex = new RegExp(search.trim(), 'i');
          query.$or = [
            { recipient: regex },
            { title: regex },
            { sender: regex }
          ];
        }
      } else {
        if (hasSearch) {
          const regex = new RegExp(search.trim(), 'i');
          query.$or = [
            { recipient: regex },
            { title: regex },
            { sender: regex },
            { $and: [{ isPrivate: false }, { content: regex }] }
          ];
          if (tag && tag.trim() !== '' && tag !== 'All') {
            query.tag = new RegExp(`^${tag.trim()}$`, 'i');
            query.isPrivate = false;
          }
        } else {
          // Default public shelf or public categories: exclude private notes
          query.isPrivate = false;
          if (tag && tag.trim() !== '' && tag !== 'All') {
            query.tag = new RegExp(`^${tag.trim()}$`, 'i');
          }
        }
      }

      let dbNotes = await Note.find(query).lean();

      if (sort === 'popular') {
        dbNotes.sort((a, b) => {
          const sumA = Object.values(a.reactions || {}).reduce((x, y) => x + y, 0);
          const sumB = Object.values(b.reactions || {}).reduce((x, y) => x + y, 0);
          return sumB - sumA;
        });
      } else {
        dbNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return res.json(dbNotes.map(sanitizeNote));
    }

    let notes = [...readNotesFallback()];
    if (isVault) {
      notes = notes.filter(n => Boolean(n.isPrivate));
      if (hasSearch) {
        const q = search.trim().toLowerCase();
        notes = notes.filter(n =>
          (n.recipient && n.recipient.toLowerCase().includes(q)) ||
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.sender && n.sender.toLowerCase().includes(q))
        );
      }
    } else {
      if (hasSearch) {
        const q = search.trim().toLowerCase();
        notes = notes.filter(n =>
          (n.recipient && n.recipient.toLowerCase().includes(q)) ||
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.sender && n.sender.toLowerCase().includes(q)) ||
          (!n.isPrivate && n.content && n.content.toLowerCase().includes(q))
        );
        if (tag && tag.trim() !== '' && tag !== 'All') {
          notes = notes.filter(n => !n.isPrivate && n.tag && n.tag.toLowerCase() === tag.trim().toLowerCase());
        }
      } else {
        notes = notes.filter(n => !n.isPrivate);
        if (tag && tag.trim() !== '' && tag !== 'All') {
          notes = notes.filter(n => n.tag && n.tag.toLowerCase() === tag.trim().toLowerCase());
        }
      }
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

router.get('/notes/random', async (req, res) => {
  try {
    const isDbConnected = await connectDB();
    if (isDbConnected) {
      const count = await Note.countDocuments({ isPrivate: false });
      if (count === 0) {
        return res.status(404).json({ error: 'No public notes found' });
      }
      const random = Math.floor(Math.random() * count);
      const randomNote = await Note.findOne({ isPrivate: false }).skip(random).lean();
      return res.json(sanitizeNote(randomNote));
    }

    const notes = readNotesFallback();
    const publicNotes = notes.filter(n => !n.isPrivate);
    if (publicNotes.length === 0) {
      return res.status(404).json({ error: 'No public notes found' });
    }
    const randomIndex = Math.floor(Math.random() * publicNotes.length);
    res.json(sanitizeNote(publicNotes[randomIndex]));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching random note' });
  }
});

router.get('/notes/:id', async (req, res) => {
  try {
    const isDbConnected = await connectDB();
    let note = null;

    if (isDbConnected) {
      note = await Note.findOne({ id: req.params.id }).lean();
      if (!note && mongoose.Types.ObjectId.isValid(req.params.id)) {
        note = await Note.findById(req.params.id).lean();
      }
    }

    if (!note) {
      const notes = readNotesFallback();
      note = notes.find(n => n.id === req.params.id || (n._id && String(n._id) === req.params.id));
    }

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.json(sanitizeNote(note));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching note' });
  }
});

router.post('/notes', async (req, res) => {
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

    const cleanPassword = isPrivate ? String(password).trim() : '';
    const cleanEncryptedData = req.body.encryptedData || (isPrivate && cleanPassword ? encryptPayload({ content: content.trim(), imageUrl: imageUrl || '', voiceUrl: voiceUrl || '' }, cleanPassword) : '');

    const newNoteObj = {
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
      password: cleanPassword,
      encryptedData: cleanEncryptedData,
      imageUrl: imageUrl || '',
      voiceUrl: voiceUrl || '',
      reactions: { heart: 0, hug: 0, star: 0, stamp: 1 },
      createdAt: new Date(),
      postmarkLocation: POSTMARKS[Math.floor(Math.random() * POSTMARKS.length)]
    };

    const isDbConnected = await connectDB();
    if (isDbConnected) {
      try {
        await Note.create(newNoteObj);
      } catch (dbErr) {
        console.warn('DB note create error, saving to fallback:', dbErr.message);
      }
    }

    const notes = readNotesFallback();
    const existingIdx = notes.findIndex(n => n.id === newNoteObj.id);
    if (existingIdx !== -1) {
      notes[existingIdx] = newNoteObj;
    } else {
      notes.unshift(newNoteObj);
    }
    writeNotesFallback(notes);
    res.status(201).json(sanitizeNote(newNoteObj));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error creating note' });
  }
});

router.post('/notes/:id/unlock', async (req, res) => {
  try {
    const { password } = req.body || {};
    const inputPass = String(password || '').trim();
    const isDbConnected = await connectDB();
    let note = null;

    if (isDbConnected) {
      note = await Note.findOne({ id: req.params.id }).lean();
      if (!note && mongoose.Types.ObjectId.isValid(req.params.id)) {
        note = await Note.findById(req.params.id).lean();
      }
    }

    if (!note) {
      const notes = readNotesFallback();
      note = notes.find(n => n.id === req.params.id || (n._id && String(n._id) === req.params.id));
    }

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (!note.isPrivate) {
      return res.json(sanitizeNote(note));
    }

    // 1. Try cipher decryption
    if (note.encryptedData) {
      try {
        const dec = decryptPayload(note.encryptedData, inputPass);
        const unlockedNote = sanitizeNote(note);
        unlockedNote.content = dec.content;
        unlockedNote.imageUrl = dec.imageUrl || '';
        unlockedNote.voiceUrl = dec.voiceUrl || '';
        unlockedNote.isUnlocked = true;
        return res.json(unlockedNote);
      } catch (decErr) {
        return res.status(401).json({ error: 'Incorrect passcode. The secret letter remains sealed.' });
      }
    }

    // 2. Try plaintext password match
    const notePassword = String(note.password || '').trim();
    if (notePassword && inputPass === notePassword) {
      const unlockedNote = { ...note };
      if (!unlockedNote.id && unlockedNote._id) {
        unlockedNote.id = String(unlockedNote._id);
      }
      delete unlockedNote.password;
      delete unlockedNote._id;
      delete unlockedNote.__v;
      unlockedNote.isUnlocked = true;
      return res.json(unlockedNote);
    } else {
      return res.status(401).json({ error: 'Incorrect passcode. The secret letter remains sealed.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error unlocking note' });
  }
});

router.post('/notes/:id/react', async (req, res) => {
  try {
    const { reactionType } = req.body || {};
    const validReactions = ['heart', 'hug', 'star', 'stamp'];

    if (!reactionType || !validReactions.includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const isDbConnected = await connectDB();
    let updatedNote = null;

    if (isDbConnected) {
      updatedNote = await Note.findOneAndUpdate(
        { id: req.params.id },
        { $inc: { [`reactions.${reactionType}`]: 1 } },
        { new: true }
      ).lean();

      if (!updatedNote && mongoose.Types.ObjectId.isValid(req.params.id)) {
        updatedNote = await Note.findByIdAndUpdate(
          req.params.id,
          { $inc: { [`reactions.${reactionType}`]: 1 } },
          { new: true }
        ).lean();
      }
    }

    const notes = readNotesFallback();
    const idx = notes.findIndex(n => n.id === req.params.id || (n._id && String(n._id) === req.params.id));
    if (idx !== -1) {
      if (!notes[idx].reactions) {
        notes[idx].reactions = { heart: 0, hug: 0, star: 0, stamp: 0 };
      }
      notes[idx].reactions[reactionType] = (notes[idx].reactions[reactionType] || 0) + 1;
      writeNotesFallback(notes);
      if (!updatedNote) {
        updatedNote = notes[idx];
      }
    }

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json(sanitizeNote(updatedNote));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error updating reaction' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const isDbConnected = await connectDB();
    if (isDbConnected) {
      const totalNotes = await Note.countDocuments();
      const distinctRecipients = await Note.distinct('recipient');
      const uniqueRecipients = distinctRecipients.length;

      const reactionAggregation = await Note.aggregate([
        {
          $group: {
            _id: null,
            totalHearts: { $sum: '$reactions.heart' },
            totalHugs: { $sum: '$reactions.hug' },
            totalStars: { $sum: '$reactions.star' },
            totalStamps: { $sum: '$reactions.stamp' }
          }
        }
      ]);

      let totalReactions = 0;
      if (reactionAggregation.length > 0) {
        const { totalHearts, totalHugs, totalStars, totalStamps } = reactionAggregation[0];
        totalReactions = (totalHearts || 0) + (totalHugs || 0) + (totalStars || 0) + (totalStamps || 0);
      }

      return res.json({
        totalNotes,
        uniqueRecipients,
        totalReactions
      });
    }

    const notes = readNotesFallback();
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
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching stats' });
  }
});

router.get('/names/popular', async (req, res) => {
  try {
    const isDbConnected = await connectDB();
    if (isDbConnected) {
      const popular = await Note.aggregate([
        { $match: { isPrivate: false } },
        { $group: { _id: '$recipient', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: '$_id', count: 1 } }
      ]);
      return res.json(popular);
    }

    const notes = readNotesFallback();
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
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error fetching popular names' });
  }
});

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
