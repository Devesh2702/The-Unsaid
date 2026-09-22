import React from 'react';
import { Search, X, Sparkles, UserCheck, Filter } from 'lucide-react';
import { playPaperSound } from '../utils/SoundEffects';

const CATEGORIES = [
  'All',
  'Love & Admiration',
  'Unsaid Words',
  'Gratitude',
  'Apology',
  'Nostalgia',
  'Encouragement',
  '🔒 Sealed Letters'
];

export default function HeroSearch({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  popularNames,
  sortBy,
  setSortBy,
  isDarkMode
}) {
  const handleClear = () => {
    playPaperSound();
    setSearchTerm('');
  };

  return (
    <section className={`relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-300 ${
      isDarkMode
        ? 'bg-[#090d16] border-slate-800 text-slate-100'
        : 'bg-gradient-to-b from-amber-100/60 via-amber-50/80 to-transparent border-amber-200/80 text-amber-950'
    }`}>
      
      {/* Decorative Stamp Watermark Background */}
      <div className={`absolute top-4 right-10 opacity-5 pointer-events-none font-cinzel text-9xl select-none hidden lg:block ${
        isDarkMode ? 'text-amber-500' : 'text-amber-800'
      }`}>
        POSTAL
      </div>
      <div className={`absolute bottom-2 left-6 opacity-5 pointer-events-none font-typewriter text-8xl select-none hidden lg:block ${
        isDarkMode ? 'text-slate-100' : 'text-amber-900'
      }`}>
        AIRMAIL
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        
        {/* Retro Badge */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-typewriter tracking-widest uppercase shadow-xs font-semibold ${
          isDarkMode
            ? 'bg-amber-950/80 border border-amber-700 text-amber-300'
            : 'bg-amber-200/60 border border-amber-400 text-amber-900'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Search Mailbox by Recipient Name</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="font-playfair text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Have an Anonymous Note Waiting for You?
          </h2>
          <p className={`text-sm sm:text-base font-serif italic max-w-2xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-amber-900/80'
          }`}>
            Type any name below to reveal all sealed letters, unsaid feelings, and secret messages left in the postbox.
          </p>
        </div>

        {/* Main Search Input Box */}
        <div className="relative max-w-2xl mx-auto">
          <div className={`relative flex items-center rounded-2xl overflow-hidden border-2 transition-all shadow-md ${
            isDarkMode
              ? 'border-slate-700 focus-within:border-amber-400 bg-[#0f172a]'
              : 'border-amber-300 focus-within:border-amber-500 bg-white'
          }`}>
            <div className={`pl-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              <Search className="w-6 h-6" />
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name (e.g. 'Sophia', 'Alex', 'To the barista')..."
              className={`w-full py-4 px-4 bg-transparent font-serif text-base sm:text-lg focus:outline-none ${
                isDarkMode ? 'text-slate-100 placeholder-slate-400' : 'text-amber-950 placeholder-amber-900/40'
              }`}
            />

            {searchTerm && (
              <button
                onClick={handleClear}
                className="pr-4 text-amber-500 hover:text-amber-300 transition-colors"
                title="Clear Search"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => playPaperSound()}
              className={`hidden sm:flex items-center gap-2 font-typewriter text-xs font-bold py-4 px-6 border-l transition-colors ${
                isDarkMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-slate-950 border-amber-500 font-bold'
                  : 'bg-amber-800 hover:bg-amber-900 text-amber-50 border-amber-400'
              }`}
            >
              <span>Search Notes</span>
            </button>
          </div>

          {/* Prompt if no search term */}
          {!searchTerm && (
            <p className={`text-[11px] font-typewriter mt-2 text-left sm:text-center ${
              isDarkMode ? 'text-slate-400' : 'text-amber-900/60'
            }`}>
              💡 Tip: Try searching your own name, a friend's first name, or words like "Library" or "Roommate".
            </p>
          )}
        </div>

        {/* Popular Recipient Name Suggestion Pills */}
        {popularNames && popularNames.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-typewriter">
            <span className={`flex items-center gap-1 font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-900'}`}>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Popular Names:</span>
            </span>
            {popularNames.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  playPaperSound();
                  setSearchTerm(item.name);
                }}
                className={`px-3 py-1 rounded-full border transition-all text-xs ${
                  searchTerm.toLowerCase() === item.name.toLowerCase()
                    ? isDarkMode
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-sm'
                      : 'bg-amber-800 text-amber-50 font-bold border-amber-900 shadow-sm'
                    : isDarkMode
                      ? 'bg-[#0f172a] text-slate-200 border-slate-700 hover:border-amber-400'
                      : 'bg-white/90 text-amber-950 border-amber-300 hover:border-amber-500 shadow-xs'
                }`}
              >
                {item.name} ({item.count})
              </button>
            ))}
          </div>
        )}

        {/* Category & Filter Tabs */}
        <div className={`pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t max-w-4xl mx-auto ${
          isDarkMode ? 'border-slate-800' : 'border-amber-200'
        }`}>
          
          {/* Tag Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            <span className={`text-xs font-typewriter flex items-center gap-1 mr-1 ${
              isDarkMode ? 'text-slate-400' : 'text-amber-900/70'
            }`}>
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Topic:</span>
            </span>
            {CATEGORIES.map((cat) => {
              const isSealed = cat === '🔒 Sealed Letters';
              const isSelected = selectedCategory === cat;
              let btnClass = '';

              if (isSealed) {
                btnClass = isSelected
                  ? (isDarkMode
                    ? 'bg-rose-500 text-white font-bold shadow-xs border border-rose-400'
                    : 'bg-rose-700 text-white font-bold border border-rose-800 shadow-xs')
                  : (isDarkMode
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:border-rose-500 hover:text-rose-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200 hover:border-rose-400');
              } else {
                btnClass = isSelected
                  ? (isDarkMode
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs border border-amber-300'
                    : 'bg-amber-800 text-amber-50 font-bold border border-amber-900 shadow-xs')
                  : (isDarkMode
                    ? 'bg-[#0f172a] text-slate-300 border border-slate-700 hover:text-slate-100 hover:border-slate-500'
                    : 'bg-white/80 text-amber-900 border border-amber-200 hover:border-amber-400');
              }

              return (
                <button
                  key={cat}
                  onClick={() => {
                    playPaperSound();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-typewriter transition-all ${btnClass}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className={`flex items-center gap-2 text-xs font-typewriter shrink-0 ${
            isDarkMode ? 'text-slate-300' : 'text-amber-950'
          }`}>
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                playPaperSound();
                setSortBy(e.target.value);
              }}
              className={`border rounded-xl px-2.5 py-1 focus:outline-none font-medium ${
                isDarkMode
                  ? 'bg-[#0f172a] text-amber-300 border-slate-700'
                  : 'bg-white text-amber-950 border-amber-300'
              }`}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Loved (Stamps)</option>
            </select>
          </div>

        </div>

      </div>
    </section>
  );
}
