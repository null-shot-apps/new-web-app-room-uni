'use client';

import { useState, useEffect } from 'react';
import { MoodEntry } from './MoodTracker';
import { analyzeMoodTrends } from '../utils/moodAnalyzer';

interface InsightsPanelProps {
  entries: MoodEntry[];
}

export default function InsightsPanel({ entries }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateInsights = async () => {
    if (entries.length === 0) {
      setInsights('Start capturing your moods to receive personalized insights!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Try API first, fallback to local analysis
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries }),
        });
        
        if (response.ok) {
          const data = await response.json() as { analysis: string };
          setInsights(data.analysis);
          return;
        }
      } catch {
        console.log('API unavailable, using local analysis');
      }
      
      // Fallback to local analysis
      const analysis = await analyzeMoodTrends(entries);
      setInsights(analysis);
    } catch {
      setError('Unable to generate insights at the moment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entries.length > 0) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  // Get recent week entries
  const recentEntries = entries.slice(0, 7);

  // Calculate mood distribution
  const getMoodDistribution = () => {
    const positive = ['happy', 'joy', 'excited', 'grateful', 'peaceful', 'content', 'blessed', 'amazing', 'wonderful', 'great'];
    const negative = ['sad', 'angry', 'frustrated', 'tired', 'anxious', 'stressed', 'worried', 'upset', 'down', 'bad'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    entries.forEach(entry => {
      const words = entry.words.map(w => w.toLowerCase());
      const hasPositive = words.some(w => positive.some(p => w.includes(p)));
      const hasNegative = words.some(w => negative.some(n => w.includes(n)));
      
      if (hasPositive && !hasNegative) positiveCount++;
      else if (hasNegative && !hasPositive) negativeCount++;
      else neutralCount++;
    });

    const total = entries.length;
    return {
      positive: Math.round((positiveCount / total) * 100),
      negative: Math.round((negativeCount / total) * 100),
      neutral: Math.round((neutralCount / total) * 100),
    };
  };

  const distribution = entries.length > 0 ? getMoodDistribution() : { positive: 0, negative: 0, neutral: 0 };

  return (
    <div className="space-y-8">
      {/* AI Insights */}
      <div className="glass-panel p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text">Your Insights</h2>
            <p className="text-white/60">AI-powered mood analysis</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <div className="text-lg leading-relaxed whitespace-pre-wrap text-white/80">
              {insights || 'Start capturing your moods to receive personalized insights!'}
            </div>
          </div>
        )}

        {entries.length > 0 && !isLoading && (
          <button
            onClick={generateInsights}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform duration-300 font-medium"
          >
            Refresh Insights
          </button>
        )}
      </div>

      {/* Mood Distribution */}
      {entries.length > 0 && (
        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-2xl font-bold mb-6 glow-text">Mood Distribution</h3>
          
          <div className="space-y-4">
            {/* Positive */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-green-400 font-medium">Positive</span>
                <span className="text-white/60">{distribution.positive}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${distribution.positive}%` }}
                />
              </div>
            </div>

            {/* Neutral */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-blue-400 font-medium">Neutral</span>
                <span className="text-white/60">{distribution.neutral}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${distribution.neutral}%` }}
                />
              </div>
            </div>

            {/* Negative */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-red-400 font-medium">Challenging</span>
                <span className="text-white/60">{distribution.negative}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${distribution.negative}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Week */}
      {recentEntries.length > 0 && (
        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-2xl font-bold mb-6 glow-text">This Week</h3>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-3xl">{entry.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{entry.words.join(' • ')}</p>
                  <p className="text-sm text-white/60">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}





