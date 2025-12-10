'use client';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] p-6">
      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-2xl w-full text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-float">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            Welcome to Your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mood Sanctuary
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-8">
            A therapeutic space to capture your emotions in 3 words + 1 emoji
          </p>
        </div>

        <div className="space-y-6 text-left mb-8">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">AI-Powered Gradients</h3>
              <p className="text-white/60">Each entry generates a unique gradient based on your mood</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Track Your Journey</h3>
              <p className="text-white/60">Visualize emotional patterns with an interactive calendar heatmap</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Personalized Insights</h3>
              <p className="text-white/60">Get gentle encouragement and trend analysis powered by AI</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-bold text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
        >
          Begin Your Journey
        </button>

        <p className="text-sm text-white/40 mt-6">
          Your entries are stored locally and privately on your device
        </p>
      </div>
    </div>
  );
}

