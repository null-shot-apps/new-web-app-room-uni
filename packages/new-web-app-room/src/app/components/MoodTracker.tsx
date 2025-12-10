'use client';

import { useState, useEffect } from 'react';
import EntryCard from './EntryCard';
import CalendarView from './CalendarView';
import InsightsPanel from './InsightsPanel';
import ParticleBackground from './ParticleBackground';
import WelcomeScreen from './WelcomeScreen';
import { useSwipe } from '../hooks/useSwipe';

export interface MoodEntry {
  id: string;
  words: string[];
  emoji: string;
  gradient: string;
  date: string;
  timestamp: number;
}

export default function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [currentView, setCurrentView] = useState<'entry' | 'calendar' | 'insights'>('entry');
  const [currentMoodColor, setCurrentMoodColor] = useState('#7849ef');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const views: ('entry' | 'calendar' | 'insights')[] = ['entry', 'calendar', 'insights'];
  
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      const currentIndex = views.indexOf(currentView);
      if (currentIndex < views.length - 1) {
        setCurrentView(views[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const currentIndex = views.indexOf(currentView);
      if (currentIndex > 0) {
        setCurrentView(views[currentIndex - 1]);
      }
    },
  });

  // Load entries from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('moodEntries');
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (stored) {
      setEntries(JSON.parse(stored));
    }
    
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
    
    setIsLoading(false);
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('moodEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const addEntry = (entry: MoodEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeScreen onStart={handleWelcomeComplete} />;
  }

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0f] text-white"
      {...swipeHandlers}
    >
      {/* Particle background that reacts to mood */}
      <ParticleBackground color={currentMoodColor} />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mood Sanctuary
              </span>
            </h1>
            
            {/* Navigation */}
            <nav className="flex gap-1 md:gap-2">
              <button
                onClick={() => setCurrentView('entry')}
                className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  currentView === 'entry'
                    ? 'glass-panel text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Entry
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  currentView === 'calendar'
                    ? 'glass-panel text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setCurrentView('insights')}
                className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  currentView === 'insights'
                    ? 'glass-panel text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Insights
              </button>
            </nav>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {currentView === 'entry' && (
              <EntryCard 
                onAddEntry={addEntry} 
                entries={entries}
                onMoodColorChange={setCurrentMoodColor}
              />
            )}
            {currentView === 'calendar' && (
              <CalendarView entries={entries} />
            )}
            {currentView === 'insights' && (
              <InsightsPanel entries={entries} />
            )}
          </div>
        </main>

        {/* Swipe indicator for mobile */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {views.map((view) => (
            <div
              key={view}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentView === view ? 'bg-purple-400 w-6' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}





