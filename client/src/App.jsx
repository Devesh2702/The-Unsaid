import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import MailroomGrid from './components/MailroomGrid';
import NoteReaderModal from './components/NoteReaderModal';
import WriteNoteModal from './components/WriteNoteModal';
import RandomPigeonModal from './components/RandomPigeonModal';
import Footer from './components/Footer';
import { fetchNotes, fetchPostOfficeStats, fetchPopularNames } from './utils/api';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Day (Light) Mode vs Night (Dark) Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('postbox_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Dynamically update body background color so 100% of the viewport turns dark in Night Mode!
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#090d16';
      document.body.style.color = '#f8fafc';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FAF6F0';
      document.body.style.color = '#451a03';
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const nextState = !prev;
      localStorage.setItem('postbox_dark_mode', JSON.stringify(nextState));
      return nextState;
    });
  };
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  // Stats & Popular Names
  const [stats, setStats] = useState({ totalNotes: 0, uniqueRecipients: 0, totalReactions: 0 });
  const [popularNames, setPopularNames] = useState([]);

  // Modals state
  const [selectedNote, setSelectedNote] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [writeRecipient, setWriteRecipient] = useState('');
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);

  // Load stats and popular names on initial render
  const loadStatsAndNames = async () => {
    const s = await fetchPostOfficeStats();
    setStats(s);
    const names = await fetchPopularNames();
    setPopularNames(names);
  };

  // Load notes whenever search, tag, or sort changes
  const loadNotes = async () => {
    setLoading(true);
    const data = await fetchNotes({
      search: searchTerm,
      tag: selectedCategory,
      sort: sortBy
    });
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStatsAndNames();
  }, []);

  useEffect(() => {
    loadNotes();
  }, [searchTerm, selectedCategory, sortBy]);

  // Handler after creating a new note
  const handleNoteDispatched = (newNote) => {
    if (newNote.isPrivate) {
      if (selectedCategory === '🔒 Sealed Letters') {
        setNotes(prev => [newNote, ...prev.filter(n => n.id !== newNote.id)]);
      } else {
        setSelectedCategory('🔒 Sealed Letters');
      }
    } else {
      if (selectedCategory === 'All' || selectedCategory === newNote.tag) {
        setNotes(prev => [newNote, ...prev.filter(n => n.id !== newNote.id)]);
      }
    }
    loadStatsAndNames();
  };

  // Handler when reaction is updated in NoteReaderModal
  const handleReactionUpdate = (updatedNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    loadStatsAndNames();
  };

  const handleOpenWriteModal = (recipientName = '') => {
    setWriteRecipient(recipientName);
    setIsWriteModalOpen(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900 ${
      isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-[#FAF6F0] text-amber-950'
    }`}>
      
      {/* Header with Sliding Sun & Moon Day/Night Toggle Switch */}
      <Header
        onOpenWriteModal={() => handleOpenWriteModal('')}
        onOpenRandomModal={() => setIsRandomModalOpen(true)}
        stats={stats}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Hero Section & Search Bar */}
      <main className="flex-1">
        <HeroSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          popularNames={popularNames}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenWriteModal={() => handleOpenWriteModal(searchTerm)}
          isDarkMode={isDarkMode}
        />

        {/* Main Mailroom Grid */}
        <MailroomGrid
          notes={notes}
          loading={loading}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onOpenNote={(note) => setSelectedNote(note)}
          onOpenWriteModalWithRecipient={(name) => handleOpenWriteModal(name)}
          isDarkMode={isDarkMode}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenWriteModal={() => handleOpenWriteModal('')}
        isDarkMode={isDarkMode}
      />

      {/* Read Note Modal */}
      {selectedNote && (
        <NoteReaderModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onReactionUpdate={handleReactionUpdate}
        />
      )}

      {/* Write Note Modal */}
      {isWriteModalOpen && (
        <WriteNoteModal
          initialRecipient={writeRecipient}
          onClose={() => {
            setIsWriteModalOpen(false);
            setWriteRecipient('');
          }}
          onNoteDispatched={handleNoteDispatched}
        />
      )}

      {/* Random Carrier Pigeon Modal */}
      {isRandomModalOpen && (
        <RandomPigeonModal
          onClose={() => setIsRandomModalOpen(false)}
        />
      )}

    </div>
  );
}
