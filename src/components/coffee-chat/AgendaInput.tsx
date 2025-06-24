'use client'
import { useState } from 'react'

interface AgendaInputProps {
  agendaBullets: string[]
  onBulletsChange: (bullets: string[]) => void
}

const suggestedTopics = [
  "Want to learn about your AI hiring process",
  "Looking to partner on climate accelerator",
  "Exploring founder funding journeys",
  "Interested in your go-to-market strategy",
  "Curious about your remote team culture",
  "Want to discuss industry trends",
  "Looking for mentorship in product development",
  "Exploring collaboration opportunities"
]

export default function AgendaInput({ agendaBullets, onBulletsChange }: AgendaInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...agendaBullets]
    newBullets[index] = value
    onBulletsChange(newBullets)
  }

  const useSuggestion = (suggestion: string) => {
    const emptyIndex = agendaBullets.findIndex(bullet => bullet.trim() === '')
    if (emptyIndex !== -1) {
      updateBullet(emptyIndex, suggestion)
    }
    setShowSuggestions(false)
  }

  const clearBullet = (index: number) => {
    updateBullet(index, '')
  }

  const filledBullets = agendaBullets.filter(bullet => bullet.trim() !== '').length

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-amber-400 flex items-center space-x-2">
          <span>💭</span>
          <span>What do you want to discuss?</span>
        </h3>
        <span className="text-sm text-gray-500">
          {filledBullets}/3 topics
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Add up to 3 discussion points to make your coffee chat more focused and valuable.
      </p>

      {/* Agenda Bullets */}
      <div className="space-y-4 mb-6">
        {agendaBullets.map((bullet, index) => (
          <div key={`agenda-bullet-${index}`} className="relative">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mt-2">
                <span className="text-xs font-semibold text-amber-400">{index + 1}</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={bullet}
                  onChange={(e) => updateBullet(index, e.target.value)}
                  placeholder={`Discussion point ${index + 1}...`}
                  rows={2}
                  maxLength={120}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-500 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {bullet.length}/120 characters
                  </span>
                  {bullet.trim() && (
                    <button
                      onClick={() => clearBullet(index)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center space-x-2 text-sm text-amber-400 hover:text-amber-300 transition"
        >
          <span>💡</span>
          <span>Need inspiration? View suggested topics</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSuggestions && (
          <div className="mt-4 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <h5 className="text-sm font-medium text-gray-300 mb-3">Suggested Topics</h5>
            <div className="grid grid-cols-1 gap-2">
              {suggestedTopics.map((topic, index) => (
                <button
                  key={`suggestion-${index}-${topic.substring(0, 20).replace(/\s+/g, '-')}`}
                  onClick={() => useSuggestion(topic)}
                  disabled={filledBullets >= 3}
                  className={`text-left p-3 rounded-lg text-sm transition ${
                    filledBullets >= 3
                      ? 'bg-zinc-800/50 text-gray-500 cursor-not-allowed'
                      : 'bg-zinc-800/50 text-gray-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 hover:border-amber-500/50'
                  }`}
                >
                  "{topic}"
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click any suggestion to add it to your agenda
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <h5 className="text-sm font-medium text-amber-400 mb-2">💡 Conversation Tips</h5>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Mention shared interests or mutual connections</li>
          <li>• Be specific about what you want to learn or discuss</li>
          <li>• Keep it conversational - these are just starting points</li>
          <li>• Leave room for organic conversation flow</li>
        </ul>
      </div>

      {/* Preview */}
      {filledBullets > 0 && (
        <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Agenda Preview</h5>
          <div className="space-y-2">
            {agendaBullets
              .filter(bullet => bullet.trim() !== '')
              .map((bullet, index) => (
                <div key={`preview-${index}-${bullet.substring(0, 10).replace(/\s+/g, '-')}`} className="flex items-start space-x-2 text-sm">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span className="text-gray-300">{bullet}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
