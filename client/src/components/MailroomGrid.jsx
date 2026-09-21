import React from 'react';
import NoteCard from './NoteCard';
import { Mail, Feather, SearchX } from 'lucide-react';
import { playPaperSound } from '../utils/SoundEffects';

export default function MailroomGrid({
  notes,
  loading,
  searchTerm,
  selectedCategory,
  onOpenNote,
  onOpenWriteModalWithRecipient,
  isDarkMode
}) {
  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-800 animate-spin text-xl">
          📮
        </div>
        <p className={`font-typewriter text-sm ${isDarkMode ? 'text-parchment-300' : 'text-amber-900'}`}>
          Unlocking postal vaults & sorting letters...
        </p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Result Counter */}
      <div className={`flex items-center justify-between mb-6 pb-3 border-b ${
        isDarkMode ? 'border-postal-brass/30 text-parchment-100' : 'border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-2">
          <Mail className={`w-5 h-5 ${isDarkMode ? 'text-postal-gold' : 'text-amber-800'}`} />
          <h3 className="font-cinzel text-lg font-bold">
            {searchTerm ? `Notes Addressed to "${searchTerm}"` : selectedCategory !== 'All' ? `${selectedCategory} Mailroom` : "Public Postal Shelf"}
          </h3>
          <span className={`px-3 py-0.5 rounded-full border text-xs font-typewriter font-bold ${
            isDarkMode
              ? 'bg-postal-brass/20 border-postal-brass/40 text-postal-gold'
              : 'bg-amber-100 border-amber-300 text-amber-900'
          }`}>
            {notes.length} {notes.length === 1 ? 'Letter' : 'Letters'}
          </span>
        </div>

        {searchTerm && (
          <p className={`hidden sm:block text-xs font-typewriter ${isDarkMode ? 'text-parchment-400' : 'text-amber-900/60'}`}>
            Showing notes matching recipient name or subject
          </p>
        )}
      </div>

      {/* Empty State when no notes found for searched recipient */}
      {notes.length === 0 ? (
        <div className={`py-16 px-6 text-center max-w-lg mx-auto rounded-2xl border-2 border-dashed space-y-5 shadow-sm ${
          isDarkMode
            ? 'bg-postal-wood/60 border-postal-brass/40 text-parchment-100'
            : 'bg-white/90 border-amber-300 text-amber-950'
        }`}>
          <div className={`w-16 h-16 mx-auto rounded-full border flex items-center justify-center shadow-inner ${
            isDarkMode ? 'bg-postal-dark border-postal-brass text-postal-gold' : 'bg-amber-100 border-amber-300 text-amber-800'
          }`}>
            <SearchX className="w-8 h-8 opacity-80" />
          </div>

          <div className="space-y-2">
            <h4 className="font-playfair text-xl font-bold">
              No Sealed Letters Found {searchTerm ? `for "${searchTerm}"` : ''}
            </h4>
            <p className={`text-xs font-serif italic leading-relaxed ${isDarkMode ? 'text-parchment-300/90' : 'text-amber-900/80'}`}>
              {searchTerm
                ? `Nobody has written an anonymous note for "${searchTerm}" yet. You can be the first to leave a heartfelt handwritten letter!`
                : `There are currently no notes in this category.`}
            </p>
          </div>

          <button
            onClick={() => {
              playPaperSound();
              onOpenWriteModalWithRecipient(searchTerm || '');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-postal-waxRed to-red-900 hover:from-red-800 hover:to-red-950 text-parchment-100 font-serif font-bold text-xs rounded-xl border border-postal-brass shadow-md transition-all"
          >
            <Feather className="w-4 h-4 text-postal-gold" />
            <span>Write the First Note {searchTerm ? `for "${searchTerm}"` : ''}</span>
          </button>
        </div>
      ) : (
        /* Envelope Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpenNote={onOpenNote}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}

    </section>
  );
}
