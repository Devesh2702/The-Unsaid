import mongoose from 'mongoose';
import Note from './models/Note.js';

const INITIAL_NOTES = [
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
    password: '',
    imageUrl: '',
    voiceUrl: '',
    reactions: { heart: 12, hug: 5, star: 8, stamp: 14 },
    createdAt: new Date('2026-09-20T14:30:00.000Z'),
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
    password: '',
    imageUrl: '',
    voiceUrl: '',
    reactions: { heart: 24, hug: 18, star: 9, stamp: 20 },
    createdAt: new Date('2026-09-21T09:15:00.000Z'),
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
    password: '',
    imageUrl: '',
    voiceUrl: '',
    reactions: { heart: 35, hug: 12, star: 42, stamp: 30 },
    createdAt: new Date('2026-09-21T18:45:00.000Z'),
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
    password: '',
    imageUrl: '',
    voiceUrl: '',
    reactions: { heart: 45, hug: 30, star: 28, stamp: 50 },
    createdAt: new Date('2026-09-22T08:00:00.000Z'),
    postmarkLocation: 'SUBURBAN OUTPOST • BOX 804'
  }
];

let isConnected = false;
let lastAttemptTime = 0;
const RETRY_INTERVAL_MS = 25000;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  const now = Date.now();
  if (!isConnected && now - lastAttemptTime < RETRY_INTERVAL_MS) {
    return false;
  }
  lastAttemptTime = now;

  const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-post-office';

  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000
    };

    await mongoose.connect(mongodbUri, opts);
    isConnected = true;
    console.log('🍃 MongoDB connected successfully!');

    // Auto-seed database if empty
    await seedInitialNotesIfNeeded();
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    isConnected = false;
    return false;
  }
}

async function seedInitialNotesIfNeeded() {
  try {
    const count = await Note.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial notes into MongoDB...');
      await Note.insertMany(INITIAL_NOTES);
      console.log('✅ Initial notes seeded successfully!');
    }
  } catch (err) {
    console.warn('Seed warning:', err.message);
  }
}

export { INITIAL_NOTES };
