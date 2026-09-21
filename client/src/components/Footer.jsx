import React from 'react';
import { Mail, Heart, Feather, ShieldCheck } from 'lucide-react';
import { playPaperSound } from '../utils/SoundEffects';

export default function Footer({ onOpenWriteModal, isDarkMode }) {
  return (
    <footer className={`mt-20 border-t py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDarkMode
        ? 'bg-[#0f172a] border-slate-800 text-slate-300'
        : 'bg-amber-100/80 border-amber-300 text-amber-950'
    }`}>
      <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b ${
        isDarkMode ? 'border-slate-800' : 'border-amber-300'
      }`}>
        
        {/* Col 1: About Post Office */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold ${
              isDarkMode ? 'bg-postal-brass/20 border-postal-brass text-postal-gold' : 'bg-amber-200 border-amber-400 text-amber-900'
            }`}>
              ✉
            </div>
            <h4 className="font-cinzel text-lg font-bold">
              THE UNSAID
            </h4>
          </div>
          <p className={`text-xs font-serif italic leading-relaxed ${
            isDarkMode ? 'text-parchment-400' : 'text-amber-900/80'
          }`}>
            A retro nostalgic digital mailroom dedicated to the warmth of handwritten notes, unsaid gratitude, and gentle thoughts sent to people we know.
          </p>
        </div>

        {/* Col 2: Postal Promises & Anonymity */}
        <div className="space-y-3">
          <h5 className={`font-cinzel text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDarkMode ? 'text-postal-gold' : 'text-amber-900'
          }`}>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Postal Guarantees</span>
          </h5>
          <ul className="text-xs font-typewriter space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">✓</span>
              <span>100% Anonymous Dispatch & Delivery</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">✓</span>
              <span>Real Handwritten Note Rendering</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">✓</span>
              <span>Searchable by Recipient Name</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Quick Dispatch CTA */}
        <div className="space-y-3">
          <h5 className={`font-cinzel text-sm font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-postal-gold' : 'text-amber-900'
          }`}>
            Send a Note Today
          </h5>
          <p className={`text-xs font-serif italic ${
            isDarkMode ? 'text-parchment-400' : 'text-amber-900/80'
          }`}>
            Someone you know might be checking the postbox for their name right now.
          </p>
          <button
            onClick={() => {
              playPaperSound();
              onOpenWriteModal();
            }}
            className={`px-4 py-2 border rounded-xl font-typewriter text-xs transition-all flex items-center gap-2 font-semibold shadow-xs ${
              isDarkMode
                ? 'bg-postal-brass/20 border-postal-brass text-postal-gold hover:bg-postal-brass hover:text-postal-dark'
                : 'bg-amber-800 border-amber-900 text-amber-50 hover:bg-amber-900'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Write an Anonymous Note</span>
          </button>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className={`max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-typewriter ${
        isDarkMode ? 'text-parchment-400/80' : 'text-amber-900/70'
      }`}>
        <div>
          © 1924–2026 The Unsaid • All Rights Sealed.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600" />
          <span>for unsaid thoughts & retro mail.</span>
        </div>
      </div>
    </footer>
  );
}
