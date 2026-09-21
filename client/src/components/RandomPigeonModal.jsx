import React, { useState, useEffect } from 'react';
import { Shuffle, Sparkles, X, ArrowRight } from 'lucide-react';
import { fetchRandomNote } from '../utils/api';
import { playPaperSound, playWaxSealSound } from '../utils/SoundEffects';
import NoteReaderModal from './NoteReaderModal';

export default function RandomPigeonModal({ onClose, onOpenNote }) {
  const [loading, setLoading] = useState(true);
  const [randomNote, setRandomNote] = useState(null);

  const loadRandom = async () => {
    setLoading(true);
    playPaperSound();
    const note = await fetchRandomNote();
    setRandomNote(note);
    setLoading(false);
  };

  useEffect(() => {
    loadRandom();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 text-center space-y-4 max-w-sm shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-600 animate-bounce text-xl">
            🕊️
          </div>
          <p className="font-typewriter text-sm text-slate-700">
            Carrier Pigeon in flight... fetching a random sealed note!
          </p>
        </div>
      </div>
    );
  }

  if (!randomNote) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-purple-200 text-center space-y-4 shadow-2xl">
          <p className="text-slate-700 text-sm font-typewriter">No notes currently available in the postbox.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <NoteReaderModal
      note={randomNote}
      onClose={onClose}
    />
  );
}
