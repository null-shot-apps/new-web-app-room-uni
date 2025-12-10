'use client';

import { useState, useMemo } from 'react';
import { MoodEntry } from './MoodTracker';

interface CalendarViewProps {
  entries: MoodEntry[];
}

export default function CalendarView({ entries }: CalendarViewProps) {
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, MoodEntry[]>();
    entries.forEach(entry => {
      const date = entry.date;
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(entry);
    });
    return map;
  }, [entries]);

  // Get last 90 days
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push(date.toISOString().split('T')[0]);
    }
    return result;
  }, []);

  // Calculate intensity for heatmap
  const getIntensity = (date: string) => {
    const dayEntries = entriesByDate.get(date);
    if (!dayEntries || dayEntries.length === 0) return 0;
    return Math.min(dayEntries.length / 3, 1); // Max intensity at 3+ entries
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 rounded-3xl">
        <h2 className="text-3xl font-bold mb-6 glow-text">Your Emotional Journey</h2>
        <p className="text-white/60 mb-8">90-day heatmap of your mood patterns</p>

        {/* Calendar heatmap */}
        <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-18 gap-2 mb-8">
          {days.map((date) => {
            const intensity = getIntensity(date);
            const dayEntries = entriesByDate.get(date) || [];
            const hasEntry = dayEntries.length > 0;
            
            return (
              <div
                key={date}
                className="relative group"
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => hasEntry && setSelectedEntry(dayEntries[0])}
              >
                <div
                  className={`aspect-square rounded-lg transition-all duration-300 cursor-pointer ${
                    hasEntry ? 'hover:scale-125 hover:z-10' : ''
                  }`}
                  style={{
                    backgroundColor: hasEntry
                      ? `rgba(120, 73, 239, ${0.2 + intensity * 0.8})`
                      : 'rgba(255, 255, 255, 0.05)',
                  }}
                />
                
                {/* Tooltip */}
                {hoveredDate === date && hasEntry && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                    <div className="glass-panel px-3 py-2 rounded-lg whitespace-nowrap text-sm">
                      <p className="font-bold">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/60">{dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}</p>
                      <div className="flex gap-1 mt-1">
                        {dayEntries.slice(0, 3).map((entry, idx) => (
                          <span key={idx} className="text-lg">{entry.emoji}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div
                key={intensity}
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: `rgba(120, 73, 239, ${0.2 + intensity * 0.8})`,
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Selected entry detail */}
      {selectedEntry && (
        <div
          className="glass-panel p-8 rounded-3xl animate-fade-in"
          style={{ background: selectedEntry.gradient }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {new Date(selectedEntry.timestamp).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-8xl">{selectedEntry.emoji}</span>
            <div className="space-y-2">
              {selectedEntry.words.map((word, idx) => (
                <p key={idx} className="text-3xl font-bold glow-text">
                  {word}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-white/60 mb-2">Total Entries</p>
          <p className="text-4xl font-bold glow-text">{entries.length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-white/60 mb-2">Current Streak</p>
          <p className="text-4xl font-bold glow-text">
            {(() => {
              let streak = 0;
              const today = new Date();
              for (let i = 0; i < 365; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                if (entriesByDate.has(dateStr)) {
                  streak++;
                } else {
                  break;
                }
              }
              return streak;
            })()}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-white/60 mb-2">Most Used Emoji</p>
          <p className="text-4xl font-bold">
            {(() => {
              const emojiCount = new Map<string, number>();
              entries.forEach(entry => {
                emojiCount.set(entry.emoji, (emojiCount.get(entry.emoji) || 0) + 1);
              });
              let maxEmoji = '—';
              let maxCount = 0;
              emojiCount.forEach((count, emoji) => {
                if (count > maxCount) {
                  maxCount = count;
                  maxEmoji = emoji;
                }
              });
              return maxEmoji;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}

