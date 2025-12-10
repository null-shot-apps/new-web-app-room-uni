import { MoodEntry } from '../components/MoodTracker';

// Mood color mappings based on semantic analysis
const moodColors: Record<string, string[]> = {
  // Positive emotions - warm, bright colors
  happy: ['#FFD700', '#FFA500', '#FF69B4'],
  joy: ['#FFD700', '#FF6B6B', '#FFA500'],
  excited: ['#FF6B6B', '#FF1493', '#FF69B4'],
  grateful: ['#FFD700', '#98D8C8', '#87CEEB'],
  peaceful: ['#87CEEB', '#98D8C8', '#B0E0E6'],
  content: ['#98D8C8', '#87CEEB', '#DDA0DD'],
  blessed: ['#FFD700', '#DDA0DD', '#FFA500'],
  amazing: ['#FF69B4', '#FFD700', '#FF6B6B'],
  wonderful: ['#FFD700', '#FF69B4', '#FFA500'],
  great: ['#FFA500', '#FFD700', '#FF6B6B'],
  love: ['#FF1493', '#FF69B4', '#FFB6C1'],
  
  // Negative emotions - cooler, darker tones
  sad: ['#4169E1', '#6A5ACD', '#483D8B'],
  angry: ['#DC143C', '#8B0000', '#B22222'],
  frustrated: ['#DC143C', '#FF4500', '#8B0000'],
  tired: ['#696969', '#778899', '#2F4F4F'],
  anxious: ['#4B0082', '#483D8B', '#6A5ACD'],
  stressed: ['#DC143C', '#4B0082', '#8B0000'],
  worried: ['#4169E1', '#4B0082', '#483D8B'],
  upset: ['#DC143C', '#4169E1', '#8B0000'],
  down: ['#4169E1', '#696969', '#483D8B'],
  bad: ['#8B0000', '#696969', '#483D8B'],
  
  // Neutral/Mixed emotions
  okay: ['#87CEEB', '#98D8C8', '#B0E0E6'],
  fine: ['#87CEEB', '#DDA0DD', '#98D8C8'],
  meh: ['#778899', '#87CEEB', '#696969'],
  confused: ['#9370DB', '#4169E1', '#6A5ACD'],
  mixed: ['#FF69B4', '#87CEEB', '#FFD700'],
  
  // Energy levels
  energetic: ['#FF6B6B', '#FFD700', '#FF1493'],
  calm: ['#87CEEB', '#98D8C8', '#B0E0E6'],
  relaxed: ['#98D8C8', '#87CEEB', '#DDA0DD'],
  motivated: ['#FFD700', '#FF6B6B', '#FFA500'],
  
  // Default
  default: ['#7849ef', '#326cd8', '#77a7ff'],
};

export function generateMoodGradient(words: string[]): string {
  const colors: string[] = [];
  
  // Analyze each word for mood
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    let foundColor = false;
    
    // Check if word contains any mood keyword
    for (const [mood, colorSet] of Object.entries(moodColors)) {
      if (lowerWord.includes(mood) || mood.includes(lowerWord)) {
        colors.push(...colorSet);
        foundColor = true;
        break;
      }
    }
    
    if (!foundColor) {
      // Use default colors
      colors.push(...moodColors.default);
    }
  });
  
  // If no colors found, use default
  if (colors.length === 0) {
    colors.push(...moodColors.default);
  }
  
  // Create gradient from collected colors
  const uniqueColors = [...new Set(colors)].slice(0, 3);
  
  return `linear-gradient(135deg, ${uniqueColors.map((c, i) => 
    `${c} ${(i / (uniqueColors.length - 1)) * 100}%`
  ).join(', ')})`;
}

export async function analyzeMoodTrends(entries: MoodEntry[]): Promise<string> {
  // Get last 7 days of entries
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEntries = entries.filter(e => e.timestamp >= weekAgo);
  
  if (recentEntries.length === 0) {
    return "You haven't logged any moods this week. Start capturing your feelings to receive personalized insights!";
  }
  
  // Analyze patterns
  const allWords = recentEntries.flatMap(e => e.words.map(w => w.toLowerCase()));
  const wordFrequency = new Map<string, number>();
  allWords.forEach(word => {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  });
  
  // Get most common words
  const topWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Sentiment analysis
  const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'peaceful', 'content', 'blessed', 'amazing', 'wonderful', 'great', 'love', 'good'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'tired', 'anxious', 'stressed', 'worried', 'upset', 'down', 'bad'];
  
  const positiveCount = allWords.filter(w => positiveWords.some(p => w.includes(p))).length;
  const negativeCount = allWords.filter(w => negativeWords.some(n => w.includes(n))).length;
  
  // Generate insights
  let insights = `📊 **Weekly Mood Analysis**\n\n`;
  insights += `You've captured ${recentEntries.length} moments this week. `;
  
  if (positiveCount > negativeCount * 2) {
    insights += `Your week has been predominantly positive! 🌟 You're experiencing a lot of uplifting emotions.\n\n`;
    insights += `**What's working:** Your most frequent feelings include "${topWords.slice(0, 3).join('", "')}". These patterns suggest you're in a good emotional space.\n\n`;
    insights += `**Encouragement:** Keep nurturing what brings you joy. Consider journaling about what's contributing to these positive feelings so you can recreate them.\n\n`;
  } else if (negativeCount > positiveCount * 2) {
    insights += `This week seems to have brought some challenges. 💙 Remember, difficult emotions are valid and temporary.\n\n`;
    insights += `**Patterns noticed:** You've been feeling "${topWords.slice(0, 3).join('", "')}". These feelings deserve acknowledgment.\n\n`;
    insights += `**Gentle reminder:** It's okay to not be okay. Consider reaching out to someone you trust, practicing self-care, or trying a small activity that usually brings you comfort. You're doing your best.\n\n`;
  } else {
    insights += `Your week shows a balanced mix of emotions - that's beautifully human. 🌈\n\n`;
    insights += `**Emotional landscape:** You've experienced "${topWords.slice(0, 3).join('", "')}". This variety shows emotional awareness.\n\n`;
    insights += `**Reflection:** Life's ups and downs are natural. You're navigating them with grace. Keep checking in with yourself.\n\n`;
  }
  
  // Consistency insight
  if (recentEntries.length >= 5) {
    insights += `**Consistency:** You're building a wonderful habit of emotional check-ins. This self-awareness is powerful for mental wellbeing. 🎯\n\n`;
  } else {
    insights += `**Tip:** Try checking in daily to spot patterns and trends in your emotional journey. Even 30 seconds can make a difference. 📝\n\n`;
  }
  
  insights += `Remember: Every emotion is valid. You're doing great by simply showing up and acknowledging how you feel. 💜`;
  
  return insights;
}

