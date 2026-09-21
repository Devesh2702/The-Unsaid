import React, { useState, useEffect } from 'react';
import { Mail, Feather, Volume2, VolumeX, Shuffle, Send, Sun, Moon } from 'lucide-react';
import { toggleAmbientSound, playPaperSound } from '../utils/SoundEffects';

export default function Header({ onOpenWriteModal, onOpenRandomModal, stats, isDarkMode, onToggleDarkMode }) {
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' • ' +
        now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    playPaperSound();
    const newState = toggleAmbientSound(!isAmbientOn);
    setIsAmbientOn(newState);
  };

  const handleToggleTheme = () => {
    playPaperSound();
    onToggleDarkMode();
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 border-b ${
      isDarkMode
        ? 'bg-[#0f172a] text-slate-100 border-slate-800 shadow-xl'
        : 'bg-white text-amber-950 border-amber-200 shadow-sm'
    }`}>
      {/* Top Banner Airmail Border Accent */}
      <div className="h-1.5 w-full bg-airmail-pattern opacity-90"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Postal Emblem */}
        <div className="flex items-center gap-3">
          <div
            className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-sm group cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-amber-950/60 border-2 border-amber-500'
                : 'bg-amber-100 border-2 border-amber-400'
            }`}
            onClick={() => { playPaperSound(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <Mail className={`w-5 h-5 transform group-hover:scale-110 group-hover:rotate-6 transition-transform ${
              isDarkMode ? 'text-amber-400' : 'text-amber-800'
            }`} />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
              isDarkMode ? 'bg-red-600 border-amber-400 text-amber-100' : 'bg-rose-500 border-white text-white'
            }`}>
              ★
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider drop-shadow-sm flex items-center gap-2">
                THE UNSAID
              </h1>
              <span className={`hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-typewriter rounded-full border font-semibold ${
                isDarkMode ? 'bg-[#090d16] text-amber-400 border-slate-700' : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                EST. 1924
              </span>
            </div>
            <p className={`text-xs font-serif italic flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>Anonymous Mailroom & Sealed Handwritten Notes</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            </p>
          </div>
        </div>

        {/* Middle Stats & Live Time */}
        <div className={`hidden lg:flex items-center gap-4 text-xs font-typewriter px-4 py-1.5 rounded-full border shadow-inner ${
          isDarkMode ? 'bg-[#090d16] text-slate-300 border-slate-800' : 'bg-amber-50 text-amber-950 border-amber-200'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{stats.totalNotes || 0}</span>
            <span>Letters Delivered</span>
          </div>
          <span className="opacity-40">•</span>
          <div>
            <span className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{stats.uniqueRecipients || 0}</span>
            <span>Recipients Addressed</span>
          </div>
          <span className="opacity-40">•</span>
          <div className="font-mono text-[11px] opacity-70">
            {timeString}
          </div>
        </div>

        {/* Action Controls, Day/Night Toggle & Dispatch Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* SLIDING DAY / NIGHT MODE SWITCH WITH SUN & MOON LOGOS */}
          <div
            onClick={handleToggleTheme}
            className={`relative w-16 h-8 rounded-full border-2 p-1 cursor-pointer transition-colors duration-300 flex items-center select-none ${
              isDarkMode
                ? 'bg-[#090d16] border-slate-700'
                : 'bg-amber-100 border-amber-400'
            }`}
            title={isDarkMode ? "Switch to Day Mode ☀️" : "Switch to Night Mode 🌙"}
          >
            {/* Background Sun/Moon icons inside track */}
            <div className="w-full flex items-center justify-between px-1 text-[11px] pointer-events-none">
              <Sun className={`w-3.5 h-3.5 transition-opacity ${isDarkMode ? 'opacity-40 text-amber-400' : 'opacity-0'}`} />
              <Moon className={`w-3.5 h-3.5 transition-opacity ${isDarkMode ? 'opacity-0' : 'opacity-40 text-indigo-700'}`} />
            </div>

            {/* Sliding Thumb Knob */}
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                isDarkMode
                  ? 'translate-x-8 bg-slate-900 text-amber-400 border border-slate-700'
                  : 'translate-x-0 bg-white text-amber-500 border border-amber-300'
              }`}
            >
              {isDarkMode ? <Moon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> : <Sun className="w-3.5 h-3.5 fill-amber-400" />}
            </div>
          </div>

          {/* Ambient Rain / Post Office Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-typewriter ${
              isAmbientOn
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-inner'
                : isDarkMode
                  ? 'bg-[#090d16] border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-500'
                  : 'bg-white border-amber-200 text-slate-700 hover:border-amber-400'
            }`}
            title={isAmbientOn ? "Mute Post Office Rain Ambience" : "Play Soft Rain & Postal Ambience"}
          >
            {isAmbientOn ? <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAmbientOn ? "Sound On" : "Ambience"}</span>
          </button>

          {/* Random Carrier Pigeon Button */}
          <button
            onClick={() => {
              playPaperSound();
              onOpenRandomModal();
            }}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-typewriter hover:shadow-sm active:scale-95 font-medium ${
              isDarkMode
                ? 'bg-[#090d16] hover:bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 border-amber-300'
            }`}
            title="Read a Random Carrier Pigeon Note"
          >
            <Shuffle className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} />
            <span className="hidden sm:inline">Random Letter</span>
          </button>

          {/* Compose Note Button */}
          <button
            onClick={() => {
              playPaperSound();
              onOpenWriteModal();
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-700 via-rose-800 to-amber-700 hover:from-red-800 hover:to-amber-800 text-amber-50 font-serif font-bold rounded-xl border border-amber-500 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm active:scale-95 group"
          >
            <Feather className="w-4 h-4 text-amber-300 group-hover:-rotate-12 transition-transform" />
            <span>Write Note</span>
            <Send className="w-3.5 h-3.5 opacity-90" />
          </button>

        </div>

      </div>
    </header>
  );
}
