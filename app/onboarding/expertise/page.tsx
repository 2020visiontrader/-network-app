'use client'
import { useState } from 'react'
import Link from 'next/link'
import OnboardingProgress from '@/components/OnboardingProgress'

const INDUSTRIES = [
  'Tech', 'AI', 'Web3', 'Finance', 'Ecommerce', 'SaaS', 'Education',
  'Wellness', 'Events', 'Fashion', 'Real Estate', 'Marketing', 'Creative',
  'Legal', 'Politics', 'Music Business', 'Content Creation', 'Venture Capital',
  'Coaching', 'Nonprofit'
]

const EXPERTISE_AREAS = [
  'Product Management', 'Engineering', 'Design', 'Sales', 'Marketing',
  'Operations', 'Strategy', 'Fundraising', 'Leadership', 'Analytics',
  'Growth', 'Partnerships', 'Community', 'Content', 'Brand'
]

export default function OnboardingExpertise() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [customExpertise, setCustomExpertise] = useState('')

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void, maxItems = 3) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else if (list.length < maxItems) {
      setList([...list, item])
    }
  }

  const addCustomExpertise = () => {
    if (customExpertise.trim() && !selectedExpertise.includes(customExpertise.trim()) && selectedExpertise.length < 5) {
      setSelectedExpertise([...selectedExpertise, customExpertise.trim()])
      setCustomExpertise('')
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <OnboardingProgress 
        currentStep={3} 
        totalSteps={6} 
        stepTitle="Expertise & Focus Areas" 
      />
      
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-3xl w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-8 backdrop-blur-md">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Your Professional Focus</h2>
            <p className="text-gray-400">Help us understand your industry and expertise areas</p>
          </div>

          <div className="space-y-8">
            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Industries (select up to 3)
                <span className="text-xs text-gray-500 ml-2">({selectedIndustries.length}/3 selected)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(industry => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleSelection(industry, selectedIndustries, setSelectedIndustries, 3)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
                      selectedIndustries.includes(industry)
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg scale-105'
                        : 'bg-zinc-800/50 text-gray-400 border-zinc-700 hover:border-purple-500 hover:text-white'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Expertise Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Expertise Areas (select up to 5)
                <span className="text-xs text-gray-500 ml-2">({selectedExpertise.length}/5 selected)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {EXPERTISE_AREAS.map(expertise => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => toggleSelection(expertise, selectedExpertise, setSelectedExpertise, 5)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
                      selectedExpertise.includes(expertise)
                        ? 'bg-yellow-500 text-black border-yellow-400 shadow-lg scale-105'
                        : 'bg-zinc-800/50 text-gray-400 border-zinc-700 hover:border-yellow-500 hover:text-white'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>

              {/* Custom Expertise */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customExpertise}
                  onChange={(e) => setCustomExpertise(e.target.value)}
                  placeholder="Add custom expertise area..."
                  className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomExpertise()}
                />
                <button
                  type="button"
                  onClick={addCustomExpertise}
                  disabled={!customExpertise.trim() || selectedExpertise.length >= 5}
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Summary */}
            {(selectedIndustries.length > 0 || selectedExpertise.length > 0) && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Your Profile Summary</h3>
                <div className="space-y-3">
                  {selectedIndustries.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Industries:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedIndustries.map(industry => (
                          <span key={industry} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedExpertise.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Expertise:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedExpertise.map(expertise => (
                          <span key={expertise} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                            {expertise}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-700">
            <Link 
              href="/onboarding/profile"
              className="px-6 py-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </Link>
            
            <div className="flex space-x-4">
              <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                Save & Exit
              </button>
              <Link 
                href="/onboarding/connect"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 transition rounded-lg font-semibold text-white"
              >
                Continue →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
