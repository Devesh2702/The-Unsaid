import React from 'react';
import { Mail, Heart, ArrowUpRight, Lock } from 'lucide-react';
import { playPaperSound, playWaxSealSound } from '../utils/SoundEffects';

// Helper maps for font preview classes
const FONT_MAP = {
  'caveat': 'font-caveat text-xl',
  'dancing-script': 'font-dancing text-lg',
  'patrick-hand': 'font-patrick text-xl',
  'sacramento': 'font-sacramento text-2xl',
  'courier-prime': 'font-typewriter text-sm',
};

// Helper maps for ink colors in Light Mode vs Dark Mode
const INK_MAP_DARK = {
  'sepia': 'text-amber-200',
  'midnight': 'text-blue-300',
  'fountain-blue': 'text-cyan-300',
  'crimson': 'text-rose-300',
  'emerald': 'text-emerald-300',
};

const INK_MAP_LIGHT = {
  'sepia': 'text-ink-sepia',
  'midnight': 'text-ink-midnight',
  'fountain-blue': 'text-ink-fountainBlue',
  'crimson': 'text-ink-crimson',
  'emerald': 'text-ink-emerald',
};

// Stamp badge rendering
function StampBadge({ design, isDarkMode }) {
  let label = "📮 PIGEON MAIL";
  let bg = isDarkMode
    ? "bg-amber-950/80 text-amber-300 border-amber-700"
    : "bg-amber-100 text-amber-900 border-amber-400";

  if (design === 'botanical-rose') {
    label = "🌹 BOTANICAL";
    bg = isDarkMode ? "bg-rose-950/80 text-rose-300 border-rose-700" : "bg-rose-100 text-rose-900 border-rose-400";
  } else if (design === 'vintage-clock') {
    label = "⏳ OLD CLOCK";
    bg = isDarkMode ? "bg-slate-800 text-slate-300 border-slate-600" : "bg-stone-200 text-stone-900 border-stone-400";
  } else if (design === 'starlight') {
    label = "🌟 STARLIGHT";
    bg = isDarkMode ? "bg-purple-950/80 text-purple-300 border-purple-700" : "bg-purple-100 text-purple-900 border-purple-400";
  } else if (design === 'airmail-stripes') {
    label = "✈️ AIRMAIL";
    bg = isDarkMode ? "bg-sky-950/80 text-sky-300 border-sky-700" : "bg-sky-100 text-sky-900 border-sky-400";
  } else if (design === 'royal-crest') {
    label = "👑 ROYAL CREST";
    bg = isDarkMode ? "bg-amber-900/80 text-amber-200 border-amber-600" : "bg-amber-200 text-amber-950 border-amber-500";
  }

  return (
    <div className={`px-2 py-0.5 rounded text-[10px] font-typewriter font-bold tracking-wider border shadow-xs ${bg}`}>
      {label}
    </div>
  );
}

// Wax seal rendering
function WaxSealBadge({ seal }) {
  let colorClass = "bg-red-700 border-amber-200 text-amber-100 shadow-wax";
  if (seal === 'antique-gold') colorClass = "bg-amber-600 border-amber-100 text-amber-950 shadow-wax";
  if (seal === 'royal-violet') colorClass = "bg-purple-700 border-purple-200 text-purple-100 shadow-wax";
  if (seal === 'forest-emerald') colorClass = "bg-emerald-700 border-emerald-200 text-emerald-100 shadow-wax";

  return (
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-cinzel text-xs font-bold ${colorClass}`}>
      <span>🦭</span>
    </div>
  );
}

export default function NoteCard({ note, onOpenNote, isDarkMode }) {
  const fontClass = FONT_MAP[note.fontFamily] || 'font-caveat text-xl';
  const inkClass = isDarkMode
    ? (INK_MAP_DARK[note.inkColor] || 'text-amber-200')
    : (INK_MAP_LIGHT[note.inkColor] || 'text-ink-sepia');

  const totalReactions = Object.values(note.reactions || {}).reduce((a, b) => a + b, 0);

  const handleClick = () => {
    playWaxSealSound();
    onOpenNote(note);
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Outer Envelope Container */}
      <div className={`relative rounded-2xl border-2 p-5 overflow-hidden transition-all ${
        isDarkMode
          ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-amber-500'
          : 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-md hover:shadow-xl hover:border-amber-500'
      }`}>
        
        {/* Vintage Airmail Stripe Header line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-airmail-pattern opacity-90"></div>

        {/* Postmark Stamp Emblem (Top Right) */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <StampBadge design={note.stampDesign} isDarkMode={isDarkMode} />
          <WaxSealBadge seal={note.waxSeal} />
        </div>

        {/* Recipient Header */}
        <div className="space-y-1 pr-24 pt-1">
          <div className={`flex flex-wrap items-center gap-1.5 text-xs font-typewriter uppercase tracking-widest ${
            isDarkMode ? 'text-slate-400' : 'text-amber-900/80'
          }`}>
            <Mail className={`w-3.5 h-3.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`} />
            <span>To:</span>
            <span className={`font-bold px-2 py-0.5 rounded border text-sm ${
              isDarkMode ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-amber-900/10 text-amber-950 border-amber-900/20'
            }`}>
              {note.recipient}
            </span>
            {note.isPrivate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-2xs">
                <Lock className="w-2.5 h-2.5" />
                <span>PRIVATE</span>
              </span>
            )}
          </div>

          <div className={`text-[11px] font-typewriter flex items-center gap-2 ${
            isDarkMode ? 'text-slate-400' : 'text-amber-900/60'
          }`}>
            <span>From: {note.sender || 'Anonymous'}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Letter Subject Title */}
        <h3 className={`mt-4 font-serif font-bold text-lg line-clamp-1 transition-colors ${
          isDarkMode ? 'text-slate-100 group-hover:text-amber-400' : 'text-amber-950 group-hover:text-red-900'
        }`}>
          "{note.title}"
        </h3>

        {/* Handwritten Teaser Content Box */}
        <div className={`mt-2 p-3 rounded-xl border shadow-inner min-h-[80px] flex items-center ${
          note.isPrivate
            ? (isDarkMode ? 'bg-rose-950/20 border-rose-900/40 text-rose-300/90' : 'bg-rose-50/70 border-rose-200/80 text-rose-900')
            : `${fontClass} ${inkClass} ${isDarkMode ? 'bg-[#090d16]/90 border-slate-800' : 'bg-white/60 border-amber-900/15'}`
        }`}>
          {note.isPrivate ? (
            <div className="flex items-center gap-2 font-serif text-xs sm:text-sm italic">
              <Lock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Sealed Secret Letter • Click to unlock with passcode</span>
            </div>
          ) : (
            <p className="line-clamp-2 leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        {/* Bottom Metadata & Unfold Button */}
        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-typewriter ${
          isDarkMode ? 'border-slate-800' : 'border-amber-900/20'
        }`}>
          
          {/* Tag & Reaction Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
              isDarkMode ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-amber-900/10 text-amber-900 border-amber-900/20'
            }`}>
              {note.tag}
            </span>

            {totalReactions > 0 && (
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                isDarkMode ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-rose-50 text-red-900 border-rose-200'
              }`}>
                <Heart className="w-3 h-3 fill-current" />
                <span>{totalReactions}</span>
              </span>
            )}
          </div>

          {/* Unfold Letter Action Indicator */}
          <div className={`flex items-center gap-1 font-bold group-hover:translate-x-1 transition-all shrink-0 ${
            isDarkMode ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-900 group-hover:text-red-900'
          }`}>
            <span>Open Note</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>

        </div>

      </div>
    </div>
  );
}
