import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { entries: any[] };
    const { entries } = body;

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        analysis: "Start capturing your moods to receive personalized insights!"
      });
    }

    // Get last 7 days of entries
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentEntries = entries.filter((e: any) => e.timestamp >= weekAgo);

    if (recentEntries.length === 0) {
      return NextResponse.json({
        analysis: "You haven't logged any moods this week. Start capturing your feelings to receive personalized insights!"
      });
    }

    // Prepare data for Claude
    const moodSummary = recentEntries.map((e: any) => ({
      words: e.words,
      emoji: e.emoji,
      date: new Date(e.timestamp).toLocaleDateString()
    }));

    // Call Claude API (if API key is available)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      // Fallback to local analysis
      return NextResponse.json({
        analysis: generateLocalInsights(recentEntries)
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are a compassionate mental wellness coach. Analyze these mood entries from the past week and provide gentle, encouraging insights. Be warm, supportive, and specific. Keep it under 200 words.

Mood entries:
${JSON.stringify(moodSummary, null, 2)}

Provide:
1. A brief observation about their emotional patterns
2. Gentle encouragement or validation
3. One small, actionable suggestion for wellbeing

Be kind, non-judgmental, and therapeutic in tone.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Claude API error');
    }

    const data = await response.json() as { content: Array<{ text: string }> };
    const analysis = data.content[0].text;

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Insights API error:', error);
    
    // Fallback to local analysis
    const body = await request.json() as { entries: any[] };
    const { entries } = body;
    return NextResponse.json({
      analysis: generateLocalInsights(entries)
    });
  }
}

function generateLocalInsights(entries: any[]): string {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEntries = entries.filter((e: any) => e.timestamp >= weekAgo);
  
  const allWords = recentEntries.flatMap((e: any) => e.words.map((w: string) => w.toLowerCase()));
  const wordFrequency = new Map<string, number>();
  allWords.forEach((word: string) => {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  });
  
  const topWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'peaceful', 'content', 'blessed', 'amazing', 'wonderful', 'great', 'love', 'good'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'tired', 'anxious', 'stressed', 'worried', 'upset', 'down', 'bad'];
  
  const positiveCount = allWords.filter((w: string) => positiveWords.some(p => w.includes(p))).length;
  const negativeCount = allWords.filter((w: string) => negativeWords.some(n => w.includes(n))).length;
  
  let insights = `📊 **Weekly Mood Analysis**\n\n`;
  insights += `You've captured ${recentEntries.length} moments this week. `;
  
  if (positiveCount > negativeCount * 2) {
    insights += `Your week has been predominantly positive! 🌟 You're experiencing a lot of uplifting emotions.\n\n`;
    insights += `**What's working:** Your most frequent feelings include "${topWords.slice(0, 3).join('", "')}". These patterns suggest you're in a good emotional space.\n\n`;
    insights += `**Encouragement:** Keep nurturing what brings you joy. Consider journaling about what's contributing to these positive feelings so you can recreate them.`;
  } else if (negativeCount > positiveCount * 2) {
    insights += `This week seems to have brought some challenges. 💙 Remember, difficult emotions are valid and temporary.\n\n`;
    insights += `**Patterns noticed:** You've been feeling "${topWords.slice(0, 3).join('", "')}". These feelings deserve acknowledgment.\n\n`;
    insights += `**Gentle reminder:** It's okay to not be okay. Consider reaching out to someone you trust, practicing self-care, or trying a small activity that usually brings you comfort.`;
  } else {
    insights += `Your week shows a balanced mix of emotions - that's beautifully human. 🌈\n\n`;
    insights += `**Emotional landscape:** You've experienced "${topWords.slice(0, 3).join('", "')}". This variety shows emotional awareness.\n\n`;
    insights += `**Reflection:** Life's ups and downs are natural. You're navigating them with grace. Keep checking in with yourself.`;
  }
  
  return insights;
}



