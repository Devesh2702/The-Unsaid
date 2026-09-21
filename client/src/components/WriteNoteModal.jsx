import React, { useState, useRef } from 'react';
import { X, Feather, Send, Eye, Sparkles, Check, Stamp as StampIcon, Lock, Unlock, Key, Image as ImageIcon, Mic, MicOff, Play, Pause, Trash2, Upload, Camera, Disc, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPaperSound, playStampSound } from '../utils/SoundEffects';
import { createNote } from '../utils/api';

const PAPER_OPTIONS = [
  { id: 'tea-stained', name: 'Tea-Stained Parchment', class: 'bg-tea-stained text-amber-950 border-amber-900/30' },
  { id: 'classic-parchment', name: 'Classic Ivory Parchment', class: 'bg-parchment-100 text-amber-950 border-amber-900/20' },
  { id: 'midnight-ink', name: 'Midnight Obsidian', class: 'bg-dark-parchment text-parchment-100 border-postal-brass/40' },
  { id: 'rose-velvet', name: 'Rose Velvet Paper', class: 'bg-rose-50 text-rose-950 border-rose-200' },
  { id: 'vintage-airmail', name: 'Vintage Airmail', class: 'bg-blue-50 text-slate-900 border-blue-200' },
  { id: 'blue-ruled', name: 'Blue Ruled Notebook', class: 'bg-ruled-paper text-slate-900 border-blue-300' },
];

const FONT_OPTIONS = [
  { id: 'caveat', name: 'Caveat (Warm Script)', class: 'font-caveat text-xl' },
  { id: 'dancing-script', name: 'Dancing Script (Fluid Cursive)', class: 'font-dancing text-lg' },
  { id: 'patrick-hand', name: 'Patrick Hand (Casual Pen)', class: 'font-patrick text-xl' },
  { id: 'sacramento', name: 'Sacramento (Elegant Quill)', class: 'font-sacramento text-2xl' },
  { id: 'courier-prime', name: 'Courier Prime (Retro Typewriter)', class: 'font-typewriter text-sm' },
];

const INK_OPTIONS = [
  { id: 'sepia', name: 'Vintage Sepia', class: 'text-ink-sepia', colorHex: '#4a3319' },
  { id: 'midnight', name: 'Midnight Ink', class: 'text-ink-midnight', colorHex: '#1a2238' },
  { id: 'fountain-blue', name: 'Fountain Pen Blue', class: 'text-ink-fountainBlue', colorHex: '#154c79' },
  { id: 'crimson', name: 'Crimson Velvet', class: 'text-ink-crimson', colorHex: '#7a121c' },
  { id: 'emerald', name: 'Emerald Quill', class: 'text-ink-emerald', colorHex: '#114b30' },
];

const STAMP_OPTIONS = [
  { id: 'pigeon', name: '📮 Pigeon Mail' },
  { id: 'botanical-rose', name: '🌹 Botanical Rose' },
  { id: 'vintage-clock', name: '⏳ Vintage Clock' },
  { id: 'starlight', name: '🌟 Starlight' },
  { id: 'airmail-stripes', name: '✈️ Airmail' },
  { id: 'royal-crest', name: '👑 Royal Crest' },
];

const WAX_OPTIONS = [
  { id: 'ruby-red', name: 'Ruby Red', bg: 'bg-postal-waxRed' },
  { id: 'antique-gold', name: 'Antique Gold', bg: 'bg-postal-waxGold' },
  { id: 'royal-violet', name: 'Royal Violet', bg: 'bg-postal-waxViolet' },
  { id: 'forest-emerald', name: 'Forest Emerald', bg: 'bg-postal-waxEmerald' },
];

const TAG_OPTIONS = [
  'Love & Admiration',
  'Unsaid Words',
  'Gratitude',
  'Apology',
  'Nostalgia',
  'Encouragement'
];

export default function WriteNoteModal({ onClose, onNoteDispatched, initialRecipient = '' }) {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [sender, setSender] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [paperTheme, setPaperTheme] = useState('tea-stained');
  const [fontFamily, setFontFamily] = useState('caveat');
  const [inkColor, setInkColor] = useState('sepia');
  const [stampDesign, setStampDesign] = useState('botanical-rose');
  const [waxSeal, setWaxSeal] = useState('ruby-red');
  const [tag, setTag] = useState('Unsaid Words');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  // Attachments: Image & Voice Note
  const [imageUrl, setImageUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioPreviewRef = useRef(null);

  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedPaper = PAPER_OPTIONS.find(p => p.id === paperTheme) || PAPER_OPTIONS[0];
  const selectedFont = FONT_OPTIONS.find(f => f.id === fontFamily) || FONT_OPTIONS[0];
  const selectedInk = INK_OPTIONS.find(i => i.id === inkColor) || INK_OPTIONS[0];

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setVoiceUrl(reader.result);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);

      const interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } catch (err) {
      console.error('Recording error:', err);
      alert('Microphone access is required to record a voice note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingInterval) clearInterval(recordingInterval);
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file should be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
    }
  };

  const handleAudioFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Audio file should be under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setVoiceUrl(reader.result);
      };
    }
  };

  const toggleVoicePreviewPlay = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingVoice) {
      audioPreviewRef.current.pause();
    } else {
      audioPreviewRef.current.play();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient.trim()) {
      setErrorMsg('Please enter a recipient name (e.g. Sophia, Alex, To the person in row 4)');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please write a message content for your note');
      return;
    }
    if (isPrivate && !password.trim()) {
      setErrorMsg('Please create a passcode for your private note.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newNote = await createNote({
        recipient,
        sender: sender.trim() || 'Anonymous',
        title: title.trim() || `A note for ${recipient.trim()}`,
        content,
        paperTheme,
        fontFamily,
        inkColor,
        stampDesign,
        waxSeal,
        tag,
        isPrivate,
        password: isPrivate ? password.trim() : '',
        imageUrl,
        voiceUrl
      });

      playStampSound();
      
      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onNoteDispatched) {
        onNoteDispatched(newNote);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch note. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border-2 border-purple-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Airmail Stripe Top */}
        <div className="h-2 bg-airmail-pattern w-full"></div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-slate-800 flex items-center gap-2">
                DISPATCH DESK — COMPOSE ANONYMOUS NOTE
              </h2>
              <p className="text-xs font-serif italic text-slate-500">
                Write a handwritten note to someone you know. It will be sealed in the public mailroom.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher for mobile/desktop */}
            <div className="flex bg-white p-1 rounded-lg border border-purple-200 text-xs font-typewriter">
              <button
                type="button"
                onClick={() => { playPaperSound(); setActiveTab('edit'); }}
                className={`px-3 py-1 rounded transition-colors ${activeTab === 'edit' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600'}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => { playPaperSound(); setActiveTab('preview'); }}
                className={`px-3 py-1 rounded transition-colors ${activeTab === 'preview' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600'}`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
              </button>
            </div>

            <button
              onClick={() => { playPaperSound(); onClose(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs font-typewriter">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Modal Main Content (Split view on large screen) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* LEFT: Compose Form Controls */}
          <form onSubmit={handleSubmit} className={`space-y-4 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Recipient Name (Crucial) */}
            <div>
              <label className="block text-xs font-typewriter text-purple-900 uppercase tracking-wider mb-1 font-bold">
                Recipient Name (Who is this for?) *
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sophia, Alex, To the person in row 4..."
                className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 font-serif text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
              />
            </div>

            {/* Sender Alias & Subject Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Your Alias / Signature
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="Anonymous (or e.g. Secret Friend)"
                  className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-serif text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Note Subject / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Thank you for yesterday..."
                  className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-serif text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Handwritten Message Content */}
            <div>
              <label className="block text-xs font-typewriter text-purple-900 uppercase tracking-wider mb-1 font-bold">
                Handwritten Message Content *
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your heartfelt note here..."
                className="w-full bg-slate-50 border border-purple-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 font-serif text-sm focus:outline-none focus:border-pink-500 focus:bg-white leading-relaxed"
              ></textarea>
            </div>

            {/* Style Pickers: Parchment Theme & Handwritten Font */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Parchment Stationery
                </label>
                <select
                  value={paperTheme}
                  onChange={(e) => { playPaperSound(); setPaperTheme(e.target.value); }}
                  className="w-full bg-slate-50 border border-purple-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-typewriter focus:outline-none focus:border-pink-500"
                >
                  {PAPER_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Handwriting Font Style
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => { playPaperSound(); setFontFamily(e.target.value); }}
                  className="w-full bg-slate-50 border border-purple-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-typewriter focus:outline-none focus:border-pink-500"
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ink Color & Category Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Ink Color
                </label>
                <select
                  value={inkColor}
                  onChange={(e) => { playPaperSound(); setInkColor(e.target.value); }}
                  className="w-full bg-slate-50 border border-purple-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-typewriter focus:outline-none focus:border-pink-500"
                >
                  {INK_OPTIONS.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Category Tag
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-typewriter focus:outline-none focus:border-pink-500"
                >
                  {TAG_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Postage Stamp & Wax Seal Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Postage Stamp Design
                </label>
                <select
                  value={stampDesign}
                  onChange={(e) => setStampDesign(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-typewriter focus:outline-none focus:border-pink-500"
                >
                  {STAMP_OPTIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-typewriter text-slate-600 mb-1 font-medium">
                  Wax Seal Color
                </label>
                <select
                  value={waxSeal}
                  onChange={(e) => setWaxSeal(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-typewriter focus:outline-none focus:border-pink-500"
                >
                  {WAX_OPTIONS.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Media Attachments: Image & Voice Note */}
            <div className="p-3.5 rounded-xl bg-pink-50/60 border border-pink-200/80 space-y-3">
              <label className="block text-xs font-typewriter text-pink-900 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-pink-600" />
                  <span>Media Attachments (Memories & Voice)</span>
                </span>
                <span className="text-[10px] text-pink-600 font-normal font-serif italic">
                  Makes note deeply emotional
                </span>
              </label>

              {/* Photo Attachment Picker */}
              <div className="space-y-1.5">
                <div className="text-xs font-typewriter text-slate-700 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                    <span>Attach Polaroid Photo</span>
                  </span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Photo
                    </button>
                  )}
                </div>

                {!imageUrl ? (
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-pink-300 rounded-xl cursor-pointer hover:bg-pink-50/50 transition-colors text-xs font-typewriter text-pink-800">
                    <Upload className="w-4 h-4 text-pink-500" />
                    <span>Upload Image (PNG/JPG max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative inline-block border-2 border-pink-200 rounded-lg overflow-hidden bg-white p-1">
                    <img src={imageUrl} alt="Attached preview" className="h-20 w-auto object-cover rounded max-w-full" />
                  </div>
                )}
              </div>

              {/* Voice Note Recording / Upload */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-typewriter text-slate-700 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-purple-600" />
                    <span>Attach Voice Note</span>
                  </span>
                  {voiceUrl && (
                    <button
                      type="button"
                      onClick={() => { setVoiceUrl(''); setIsPlayingVoice(false); }}
                      className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Voice Note
                    </button>
                  )}
                </div>

                {!voiceUrl ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-typewriter text-xs font-bold transition-all shadow-sm"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Record Live Audio</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl font-typewriter text-xs font-bold animate-pulse shadow-sm"
                      >
                        <Disc className="w-4 h-4 animate-spin" />
                        <span>Recording... ({recordingSeconds}s) — Stop</span>
                      </button>
                    )}

                    <span className="text-xs font-typewriter text-slate-400">or</span>

                    <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors text-xs font-typewriter text-slate-700">
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      <span>Upload Audio File</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-purple-100/70 border border-purple-200 rounded-xl">
                    <button
                      type="button"
                      onClick={toggleVoicePreviewPlay}
                      className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="text-xs font-typewriter text-purple-900 font-medium">
                      <span>🎙️ Voice Note Attached</span>
                    </div>
                    <audio
                      ref={audioPreviewRef}
                      src={voiceUrl}
                      onPlay={() => setIsPlayingVoice(true)}
                      onEnded={() => setIsPlayingVoice(false)}
                      onPause={() => setIsPlayingVoice(false)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Setting Toggle */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-3">
              <label className="block text-xs font-typewriter text-purple-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-pink-500" />
                <span>Note Privacy & Access Control</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs font-typewriter">
                <button
                  type="button"
                  onClick={() => { playPaperSound(); setIsPrivate(false); setPassword(''); }}
                  className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    !isPrivate
                      ? 'bg-purple-600 text-white font-bold border-purple-600 shadow-sm'
                      : 'bg-white text-slate-600 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>🌐 Public Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => { playPaperSound(); setIsPrivate(true); }}
                  className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    isPrivate
                      ? 'bg-rose-500 text-white font-bold border-rose-500 shadow-sm'
                      : 'bg-white text-slate-600 border-purple-200 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔒 Private Note</span>
                </button>
              </div>

              {isPrivate && (
                <div className="pt-1 space-y-1.5 animate-fade-in">
                  <label className="block text-xs font-typewriter text-slate-700 font-semibold flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-pink-500" />
                    <span>Create Secret Passcode / Passkey *</span>
                  </label>
                  <input
                    type="text"
                    required={isPrivate}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. 1234 or a secret word for the recipient..."
                    className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                  <p className="text-[10px] font-typewriter text-slate-500">
                    🔒 Readers will be prompted to enter this secret passcode to open and read your letter.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 hover:from-rose-500 hover:to-purple-600 text-white font-serif font-bold rounded-xl border border-pink-300 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <StampIcon className="w-5 h-5 text-pink-100" />
                <span>{isSubmitting ? "Sealing & Dispatching..." : isPrivate ? "Seal & Lock Private Note" : "Seal & Drop into Postbox"}</span>
                <Send className="w-4 h-4 ml-1 opacity-90" />
              </button>
            </div>

          </form>

          {/* RIGHT: Live Handwritten Letter Preview */}
          <div className={`${activeTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
            <div className="text-xs font-typewriter text-pink-600 uppercase tracking-wider mb-2 flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Live Handwritten Letter Preview</span>
              </span>
              {isPrivate && (
                <span className="flex items-center gap-1 text-[10px] text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                  <Lock className="w-3 h-3" />
                  <span>Passcode Protected</span>
                </span>
              )}
            </div>

            {/* Parchment Preview Card */}
            <div className={`relative rounded-xl border-4 p-6 ${selectedPaper.class} shadow-xl min-h-[380px] overflow-hidden`}>
              
              <div className="absolute top-0 left-0 right-0 h-2 bg-airmail-pattern opacity-90"></div>

              {/* Header */}
              <div className="border-b border-amber-900/20 pb-3 mb-4 pr-16">
                <div className="text-xs font-typewriter text-amber-900/70">To:</div>
                <div className="font-serif font-bold text-xl text-amber-950">
                  {recipient || '[Recipient Name]'}
                </div>
                <div className="text-[11px] font-typewriter text-amber-900/60 mt-1">
                  From: {sender || 'Anonymous'}
                </div>
              </div>

              {/* Title preview */}
              <div className="font-serif italic font-bold text-sm text-amber-950 mb-3">
                "{title || 'Untitled Note'}"
              </div>

              {/* Photo preview in Polaroid style */}
              {imageUrl && (
                <div className="my-3 flex justify-center">
                  <div className="bg-white p-2 border border-slate-200 shadow-md rounded transform -rotate-2 max-w-[200px]">
                    <img src={imageUrl} alt="Polaroid Memory" className="w-full h-28 object-cover rounded-xs" />
                    <div className="text-center font-caveat text-amber-950 text-xs mt-1 font-bold">
                      📸 Memory Attached
                    </div>
                  </div>
                </div>
              )}

              {/* Voice note cassette preview */}
              {voiceUrl && (
                <div className="my-3 p-2 bg-amber-900/10 border border-amber-900/20 rounded-xl flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-typewriter text-xs text-amber-950 font-bold">
                    🎙️ Voice Note Included
                  </span>
                </div>
              )}

              {/* Content Handwritten preview */}
              <div className={`my-4 ${selectedFont.class} ${selectedInk.class} whitespace-pre-wrap leading-relaxed`}>
                {content || 'Your handwritten message will appear here in real-time as you type...'}
              </div>

              {/* Footer Stamp & Wax preview */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-90">
                <div className="px-2 py-0.5 rounded text-[9px] font-typewriter font-bold bg-amber-900/10 text-amber-900 border border-amber-900/20">
                  {tag}
                </div>
                <div className="w-8 h-8 rounded-full bg-postal-waxRed border-2 border-amber-200 shadow-wax flex items-center justify-center text-amber-100 font-cinzel text-xs font-bold">
                  🦭
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
