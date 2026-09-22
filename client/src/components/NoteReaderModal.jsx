import React, { useState, useRef } from 'react';
import { X, Heart, Sparkles, Coffee, Stamp as StampIcon, Share2, Check, ArrowLeft, Calendar, Tag, User, Lock, KeyRound, Play, Pause, Volume2, Disc, Camera, Eye, EyeOff } from 'lucide-react';
import { playPaperSound, playStampSound, playWaxSealSound } from '../utils/SoundEffects';
import { reactToNote, unlockNote } from '../utils/api';

const FONT_CLASSES = {
  'caveat': 'font-caveat text-2xl sm:text-3xl leading-relaxed',
  'dancing-script': 'font-dancing text-2xl sm:text-3xl leading-relaxed',
  'patrick-hand': 'font-patrick text-2xl sm:text-3xl leading-relaxed',
  'sacramento': 'font-sacramento text-3xl sm:text-4xl leading-loose',
  'courier-prime': 'font-typewriter text-base sm:text-lg leading-relaxed',
};

const INK_CLASSES = {
  'sepia': 'text-ink-sepia',
  'midnight': 'text-ink-midnight',
  'fountain-blue': 'text-ink-fountainBlue',
  'crimson': 'text-ink-crimson',
  'emerald': 'text-ink-emerald',
};

const PAPER_CLASSES = {
  'tea-stained': 'bg-tea-stained text-amber-950 shadow-2xl border-amber-900/30',
  'classic-parchment': 'bg-parchment-100 text-amber-950 shadow-2xl border-amber-900/20',
  'midnight-ink': 'bg-dark-parchment text-parchment-100 shadow-2xl border-postal-brass/40',
  'rose-velvet': 'bg-rose-50 text-rose-950 shadow-2xl border-rose-200',
  'vintage-airmail': 'bg-blue-50 text-slate-900 shadow-2xl border-blue-200',
  'blue-ruled': 'bg-ruled-paper text-slate-900 shadow-2xl border-blue-300',
};

export default function NoteReaderModal({ note, onClose, onReactionUpdate }) {
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState(note?.reactions || { heart: 0, hug: 0, star: 0, stamp: 0 });
  const [animatingReaction, setAnimatingReaction] = useState(null);

  // Private note unlock state
  const alreadyUnlocked = !note?.isPrivate || Boolean(note?.isUnlocked) || (note?.rawContent && note?.content !== '🔒 Private Secret Note (Password Protected)');
  const [isUnlocked, setIsUnlocked] = useState(alreadyUnlocked);
  const [unlockedContent, setUnlockedContent] = useState(alreadyUnlocked ? (note?.rawContent || note?.content) : null);
  const [unlockedImageUrl, setUnlockedImageUrl] = useState(alreadyUnlocked ? note?.imageUrl : null);
  const [unlockedVoiceUrl, setUnlockedVoiceUrl] = useState(alreadyUnlocked ? note?.voiceUrl : null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  if (!note) return null;

  const fontStyle = FONT_CLASSES[note.fontFamily] || FONT_CLASSES['caveat'];
  const inkStyle = INK_CLASSES[note.inkColor] || INK_CLASSES['sepia'];
  const paperStyle = PAPER_CLASSES[note.paperTheme] || PAPER_CLASSES['tea-stained'];

  const displayImageUrl = unlockedImageUrl || note.imageUrl;
  const displayVoiceUrl = unlockedVoiceUrl || note.voiceUrl;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleUnlockNote = async (e) => {
    e.preventDefault();
    const cleanPass = inputPasscode.trim();
    if (!cleanPass) return;

    setIsUnlocking(true);
    setUnlockError('');

    try {
      const targetId = note.id || note._id;
      const unlocked = await unlockNote(targetId, cleanPass);
      playWaxSealSound();
      setUnlockedContent(unlocked.content);
      setUnlockedImageUrl(unlocked.imageUrl);
      setUnlockedVoiceUrl(unlocked.voiceUrl);
      setIsUnlocked(true);
      if (onReactionUpdate) {
        onReactionUpdate(unlocked);
      }
    } catch (err) {
      setUnlockError(err.message || 'Incorrect passcode. The secret letter remains sealed.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleReact = async (type) => {
    playStampSound();
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);

    const updated = await reactToNote(note.id, type);
    if (updated && updated.reactions) {
      setReactions(updated.reactions);
      if (onReactionUpdate) onReactionUpdate(updated);
    }
  };

  const handleCopyLink = () => {
    playPaperSound();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl my-8 mx-auto">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-3 text-slate-700">
          <button
            onClick={() => {
              playPaperSound();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-typewriter hover:text-pink-600 transition-colors px-3 py-1.5 rounded-xl bg-white/90 border border-purple-200 shadow-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600" />
            <span>Return to Mailroom</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-xs font-typewriter hover:text-pink-600 px-3 py-1.5 rounded-xl bg-white/90 border border-purple-200 shadow-xs font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-purple-600" />}
              <span>{copied ? "Copied Link!" : "Share Letter"}</span>
            </button>

            <button
              onClick={() => {
                playPaperSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 transition-colors shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real Handwritten Letter Parchment */}
        <div className={`relative rounded-2xl border-4 p-6 sm:p-10 ${paperStyle} animate-letter-slide overflow-hidden`}>
          
          {/* Airmail Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-airmail-pattern opacity-90"></div>

          {/* Authentic Postmark cancellation stamp circle (Top Right) */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-10 pointer-events-none opacity-80 flex flex-col items-end">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-amber-900/60 p-2 transform -rotate-12 flex flex-col items-center justify-center text-center">
              <span className="font-cinzel text-[9px] font-bold tracking-widest text-amber-950 uppercase">
                {note.postmarkLocation || 'AIRMAIL DISPATCH'}
              </span>
              <div className="my-0.5 border-t border-b border-amber-900/40 w-full py-0.5 text-[8px] font-typewriter text-amber-900">
                ★ SEALED & VERIFIED ★
              </div>
              <span className="font-typewriter text-[9px] text-amber-900">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Letter Address Header */}
          <div className="mb-6 pb-4 border-b-2 border-amber-900/20 pr-28 sm:pr-36">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-typewriter text-xs uppercase tracking-widest text-amber-900/70">To:</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950 underline decoration-amber-900/30 decoration-wavy">
                {note.recipient}
              </h2>
              {note.isPrivate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-typewriter font-bold bg-rose-500 text-white shadow-sm">
                  <Lock className="w-3 h-3" />
                  <span>PRIVATE NOTE</span>
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-typewriter text-amber-900/80">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-800" />
                <span>From: <strong className="text-amber-950">{note.sender || 'Anonymous'}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-800" />
                <span>{note.tag}</span>
              </span>
            </div>
          </div>

          {/* Note Title */}
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-950 mb-6 italic">
            "{note.title}"
          </h3>

          {/* Private Note Passcode Prompt OR Authentic Handwritten Body */}
          {!isUnlocked ? (
            <div className="my-8 p-6 sm:p-8 rounded-2xl bg-amber-900/10 border-2 border-dashed border-amber-900/30 text-center space-y-4 max-w-md mx-auto shadow-inner">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg animate-pulse">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-amber-950">
                  Sealed Private Note
                </h4>
                <p className="text-xs font-typewriter text-amber-900/80 leading-relaxed">
                  This note is password-protected by the writer. Please enter the passcode to unseal and read the secret message.
                </p>
              </div>

              {unlockError && (
                <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-typewriter">
                  ⚠️ {unlockError}
                </div>
              )}

              <form onSubmit={handleUnlockNote} className="space-y-3 pt-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={inputPasscode}
                    onChange={(e) => {
                      setInputPasscode(e.target.value);
                      if (unlockError) setUnlockError('');
                    }}
                    placeholder="Enter secret passcode..."
                    className="w-full text-center px-10 py-3 bg-white/90 border border-amber-900/30 rounded-xl font-mono text-sm text-amber-950 placeholder-amber-900/40 focus:outline-none focus:border-rose-500 shadow-inner"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-900/50 hover:text-amber-950 p-1.5 rounded-lg hover:bg-amber-900/10 transition-colors"
                    title={showPassword ? "Hide passcode" : "Show passcode"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-serif font-bold rounded-xl border border-rose-300 shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isUnlocking ? "Unsealing Vault..." : "Unlock & Read Message"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Polaroid Photo Frame if photo attached */}
              {displayImageUrl && (
                <div className="my-6 flex justify-center">
                  <div className="bg-white p-3 sm:p-4 pb-6 sm:pb-8 rounded-sm shadow-xl border border-slate-200 transform -rotate-1 hover:rotate-0 transition-transform duration-300 max-w-sm w-full">
                    <div className="relative overflow-hidden rounded-xs bg-slate-900 border border-slate-100 aspect-4/3 flex items-center justify-center">
                      <img
                        src={displayImageUrl}
                        alt="Attached memory photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-3 text-center font-caveat text-lg sm:text-xl text-amber-950 font-bold tracking-wide">
                      📸 Memory Attached to Note
                    </div>
                  </div>
                </div>
              )}

              {/* Vintage Cassette Tape Player if voice note attached */}
              {displayVoiceUrl && (
                <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border-2 border-purple-400/40 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-typewriter text-purple-200">
                    <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-pink-300">
                      <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                      <span>VINTAGE VOICE CASSETTE TAPE</span>
                    </span>
                    <span className="text-[10px] bg-purple-800/60 px-2 py-0.5 rounded border border-purple-400/30">
                      SIDE A • HIGH BIAS AUDIO
                    </span>
                  </div>

                  {/* Cassette Body Graphics with Spinning Spools */}
                  <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 flex items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border-4 border-dashed border-pink-400 bg-purple-900 flex items-center justify-center ${isPlayingAudio ? 'animate-spin' : ''}`}>
                        <Disc className="w-5 h-5 text-pink-200" />
                      </div>

                      <div>
                        <div className="font-typewriter text-xs text-purple-100 font-bold">
                          Recorded Voice Message
                        </div>
                        <div className="font-serif italic text-[11px] text-purple-300">
                          {isPlayingAudio ? "Playing voice note..." : "Click play button to hear voice note"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={toggleAudio}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                    >
                      {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>

                    <audio
                      ref={audioRef}
                      src={displayVoiceUrl}
                      onPlay={() => setIsPlayingAudio(true)}
                      onEnded={() => setIsPlayingAudio(false)}
                      onPause={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Handwritten Content */}
              <div className={`my-6 min-h-[180px] ${fontStyle} ${inkStyle} whitespace-pre-wrap selection:bg-amber-300 selection:text-amber-950 animate-fade-in`}>
                {unlockedContent || note.content}
              </div>
            </div>
          )}

          {/* Wax Seal Signoff & Closing */}
          <div className="mt-8 pt-6 border-t-2 border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="font-serif italic text-sm text-amber-900/80">
              "Words once spoken or written float forever in the post office of time."
            </div>

            {/* Wax Seal Graphic */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-postal-waxRed border-2 border-amber-200 shadow-wax flex items-center justify-center text-amber-100 font-cinzel font-bold text-lg animate-wax">
                🦭
              </div>
              <div className="text-[11px] font-typewriter text-amber-900/70">
                <div>OFFICIAL SEAL</div>
                <div className="font-bold text-amber-950">ANONYMOUS MAIL</div>
              </div>
            </div>

          </div>

          {/* Stamp Reactions Section */}
          <div className="mt-8 pt-4 bg-amber-900/10 rounded-xl p-4 border border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-typewriter text-amber-950 font-bold flex items-center gap-1.5">
              <StampIcon className="w-4 h-4 text-postal-waxRed" />
              <span>Leave a Postal Stamp Reaction:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReact('heart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-typewriter text-xs transition-all active:scale-90 ${
                  animatingReaction === 'heart' ? 'scale-125 bg-red-200 border-red-500' : 'bg-white/80 border-amber-900/30 hover:bg-white text-red-900'
                }`}
              >
                <Heart className="w-4 h-4 text-red-700 fill-red-700" />
                <span>Heart ({reactions.heart || 0})</span>
              </button>

              <button
                onClick={() => handleReact('hug')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-typewriter text-xs transition-all active:scale-90 ${
                  animatingReaction === 'hug' ? 'scale-125 bg-amber-200 border-amber-500' : 'bg-white/80 border-amber-900/30 hover:bg-white text-amber-900'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-800" />
                <span>Warm Hug ({reactions.hug || 0})</span>
              </button>

              <button
                onClick={() => handleReact('star')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-typewriter text-xs transition-all active:scale-90 ${
                  animatingReaction === 'star' ? 'scale-125 bg-purple-200 border-purple-500' : 'bg-white/80 border-amber-900/30 hover:bg-white text-purple-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>Starlight ({reactions.star || 0})</span>
              </button>

              <button
                onClick={() => handleReact('stamp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-typewriter text-xs transition-all active:scale-90 ${
                  animatingReaction === 'stamp' ? 'scale-125 bg-blue-200 border-blue-500' : 'bg-white/80 border-amber-900/30 hover:bg-white text-blue-900'
                }`}
              >
                <StampIcon className="w-4 h-4 text-blue-800" />
                <span>Stamped ({reactions.stamp || 0})</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
