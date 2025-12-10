'use client';

import { useState, useEffect } from 'react';
import { MoodEntry } from './MoodTracker';
import { generateMoodGradient } from '../utils/moodAnalyzer';

interface EntryCardProps {
  onAddEntry: (entry: MoodEntry) => void;
  entries: MoodEntry[];
  onMoodColorChange: (color: string) => void;
}

export default function EntryCard({ onAddEntry, entries, onMoodColorChange }: EntryCardProps) {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [emoji, setEmoji] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update mood color as user types
  useEffect(() => {
    if (word1 || word2 || word3) {
      const words = [word1, word2, word3].filter(w => w);
      const gradient = generateMoodGradient(words);
      // Extract first color from gradient
      const match = gradient.match(/rgba?\([^)]+\)/);
      if (match) {
        onMoodColorChange(match[0]);
      }
    }
  }, [word1, word2, word3, onMoodColorChange]);

  const handleSubmit = async () => {
    if (!word1 || !word2 || !word3 || !emoji) return;

    setIsSubmitting(true);
    
    const words = [word1, word2, word3];
    const gradient = generateMoodGradient(words);
    
    const entry: MoodEntry = {
      id: Date.now().toString(),
      words,
      emoji,
      gradient,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    await new Promise(resolve => setTimeout(resolve, 500)); // Smooth animation
    
    onAddEntry(entry);
    
    // Reset form
    setWord1('');
    setWord2('');
    setWord3('');
    setEmoji('');
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleShare = async (entry: MoodEntry) => {
    // Create a shareable image/text
    const text = `${entry.words.join(' • ')} ${entry.emoji}\n\nMy mood today on Mood Sanctuary`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          text,
          title: 'My Mood Today',
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Entry input card */}
      <div
        className={`glass-panel p-8 md:p-12 rounded-3xl transition-all duration-500 ${
          isHovered ? 'scale-[1.02] shadow-2xl' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 glow-text">
            How are you feeling?
          </h2>
          <p className="text-white/60 text-lg">Capture your day in 3 words + 1 emoji</p>
        </div>

        {/* Word inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value)}
            placeholder="First word..."
            maxLength={20}
            className="glass-input text-2xl md:text-3xl font-bold text-center py-6 rounded-2xl"
          />
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value)}
            placeholder="Second word..."
            maxLength={20}
            className="glass-input text-2xl md:text-3xl font-bold text-center py-6 rounded-2xl"
          />
          <input
            type="text"
            value={word3}
            onChange={(e) => setWord3(e.target.value)}
            placeholder="Third word..."
            maxLength={20}
            className="glass-input text-2xl md:text-3xl font-bold text-center py-6 rounded-2xl"
          />
        </div>

        {/* Emoji input */}
        <div className="mb-8">
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Add an emoji 😊"
            maxLength={2}
            className="glass-input text-5xl md:text-6xl text-center py-8 rounded-2xl w-full"
          />
          {/* Quick emoji suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['😊', '😢', '😡', '😴', '😰', '🥰', '😌', '🤔', '😎', '🥳', '😔', '💪'].map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="text-3xl p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!word1 || !word2 || !word3 || !emoji || isSubmitting}
          className={`w-full py-6 rounded-2xl font-bold text-xl transition-all duration-300 ${
            word1 && word2 && word3 && emoji
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.02] hover:shadow-2xl'
              : 'bg-white/10 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Saving...' : showSuccess ? '✓ Saved!' : 'Capture This Moment'}
        </button>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white/80">Your Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                className="glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                style={{
                  background: entry.gradient,
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-6xl">{entry.emoji}</span>
                  <button
                    onClick={() => handleShare(entry)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {entry.words.map((word, idx) => (
                    <p key={idx} className="text-2xl font-bold glow-text">
                      {word}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-white/60 mt-4">
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



