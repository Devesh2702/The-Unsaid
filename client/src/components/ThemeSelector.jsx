import React, { useState } from 'react';
import { Palette, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { playPaperSound } from '../utils/SoundEffects';

export const THEMES = [
  {
    id: 'skeuomorphism',
    name: 'Skeuomorphism',
    icon: '🪵',
    tagline: 'Classic Wood, Brass & Vintage Wax',
    previewBg: 'bg-postal-wood border-postal-brass',
    accentColor: '#c69214'
  },
  {
    id: 'neomorphism',
    name: 'Neomorphism',
    icon: '🔲',
    tagline: 'Soft Extruded 3D Relief Shadows',
    previewBg: 'bg-[#1e222a] border-[#292f39]',
    accentColor: '#60a5fa'
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    icon: '❄️',
    tagline: 'Frosted Glass & Glowing Auroras',
    previewBg: 'bg-indigo-950/80 backdrop-blur-md border-indigo-400/40',
    accentColor: '#a855f7'
  },
  {
    id: 'claymorphism',
    name: 'Claymorphism',
    icon: '🧱',
    tagline: 'Chubby 3D Soft Clay & Pastel Shadows',
    previewBg: 'bg-purple-950 border-pink-400/50',
    accentColor: '#f472b6'
  },
  {
    id: 'minimalism',
    name: 'Minimalism',
    icon: '🏁',
    tagline: 'Stark Monochrome & Crisp Lines',
    previewBg: 'bg-neutral-950 border-neutral-700',
    accentColor: '#ffffff'
  },
  {
    id: 'maximalism',
    name: 'Maximalism',
    icon: '🎨',
    tagline: 'Vibrant Pop Art & Wild Stamps',
    previewBg: 'bg-gradient-to-r from-fuchsia-900 via-rose-900 to-amber-900 border-yellow-400',
    accentColor: '#facc15'
  },
  {
    id: 'brutalism',
    name: 'Brutalism',
    icon: '⚡',
    tagline: 'Neo-Brutalist Hard Shadows & Bold Borders',
    previewBg: 'bg-amber-100 text-black border-4 border-black shadow-[3px_3px_0px_#000]',
    accentColor: '#000000'
  },
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    icon: '💧',
    tagline: 'Fluid Aqua Mesh & Gloss Reflections',
    previewBg: 'bg-teal-950 border-cyan-400/40',
    accentColor: '#2dd4bf'
  },
  {
    id: 'bento-grid',
    name: 'Bento Grid',
    icon: '🍱',
    tagline: 'Modular Bento Compartments & Metric Widgets',
    previewBg: 'bg-[#090d16] border-slate-700',
    accentColor: '#38bdf8'
  },
  {
    id: 'spatial-ui',
    name: 'Spatial UI',
    icon: '🥽',
    tagline: 'Holographic 3D Depth & Spatial Vision',
    previewBg: 'bg-[#0a0518] border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    accentColor: '#c084fc'
  }
];

export default function ThemeSelector({ currentTheme, onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  const handleSelect = (themeId) => {
    playPaperSound();
    onSelectTheme(themeId);
  };

  return (
    <section className="bg-postal-wood/90 border-b border-postal-brass/30 py-3 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Title / Current Active Theme Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-postal-brass/20 border border-postal-brass flex items-center justify-center text-postal-gold shadow-sm">
            <Palette className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-typewriter text-postal-gold uppercase font-bold tracking-wider">
                Postbox Theme Studio:
              </span>
              <span className="text-xs font-serif font-bold text-parchment-100 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-postal-dark border border-postal-brass/40 shadow-inner">
                <span>{activeThemeObj.icon}</span>
                <span>{activeThemeObj.name}</span>
              </span>
            </div>
            <p className="text-[11px] font-serif italic text-parchment-400 hidden md:block">
              {activeThemeObj.tagline}
            </p>
          </div>
        </div>

        {/* Theme Pills Bar (Quick Switcher on desktop, Collapsible on Mobile) */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto">
          {THEMES.map((theme) => {
            const isActive = theme.id === currentTheme;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-typewriter transition-all duration-200 ${
                  isActive
                    ? 'bg-postal-brass text-postal-dark font-bold shadow-md scale-105 border-2 border-postal-gold ring-2 ring-postal-brass/50'
                    : 'bg-postal-dark/80 text-parchment-300 border border-postal-brass/25 hover:border-postal-brass hover:text-parchment-100 hover:scale-102'
                }`}
                title={theme.tagline}
              >
                <span>{theme.icon}</span>
                <span className="hidden lg:inline">{theme.name}</span>
                {isActive && <Check className="w-3 h-3 text-postal-dark stroke-[3]" />}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
