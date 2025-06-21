'use client'
import { useState } from 'react'

interface CreateMastermindFormProps {
  onClose: () => void
}

interface MastermindFormData {
  name: string;
  goal: string;
  tags: string[];
  maxMembers: number;
  cadence: string;
  preferredDay: string;
  preferredTime: string;
  resourceLinks: string[];
}

const availableTags = [
  'B2B SaaS', 'Funding', 'GTM', 'Climate Tech', 'Impact', 'Web3', 'Leadership', 
  'Diversity', 'AI', 'Fintech', 'Wellness', 'Creative', 'Marketing', 'Sales',
  'Product', 'Engineering', 'Design', 'Operations', 'Strategy'
]

const cadenceOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' }
]

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function CreateMastermindForm({ onClose }: CreateMastermindFormProps) {
  const [formData, setFormData] = useState<MastermindFormData>({
    name: '',
    goal: '',
    tags: [] as string[],
    maxMembers: 4,
    cadence: 'biweekly',
    preferredDay: '',
    preferredTime: '',
    resourceLinks: ['']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const updateFormData = (field: keyof MastermindFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tag: string) => {
    const currentTags = formData.tags
    if (currentTags.includes(tag)) {
      updateFormData('tags', currentTags.filter(t => t !== tag))
    } else if (currentTags.length < 5) {
      updateFormData('tags', [...currentTags, tag])
    }
  }

  const addResourceLink = () => {
    updateFormData('resourceLinks', [...formData.resourceLinks, ''])
  }

  const updateResourceLink = (index: number, value: string) => {
    const newLinks = [...formData.resourceLinks]
    newLinks[index] = value
    updateFormData('resourceLinks', newLinks)
  }

  const removeResourceLink = (index: number) => {
    updateFormData('resourceLinks', formData.resourceLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowSuccess(true)
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to create mastermind:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.goal && formData.tags.length > 0

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-zinc-900/95 border border-green-500/50 rounded-2xl p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Mastermind Created! 🧬</h3>
          <p className="text-gray-300">Your group is live — invite others to join.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create a Mastermind Group</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Goal */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., Scaling SaaS from $10k to $100k MRR"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Goal *
                </label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => updateFormData('goal', e.target.value)}
                  placeholder="What specific outcome do you want to achieve together?"
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags * (Select up to 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-2 rounded-full text-sm transition ${
                      formData.tags.includes(tag)
                        ? 'bg-purple-600 text-white border border-purple-400'
                        : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:border-purple-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.tags.length}/5 tags selected
              </p>
            </div>

            {/* Max Members & Cadence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Members
                </label>
                <select
                  value={formData.maxMembers}
                  onChange={(e) => updateFormData('maxMembers', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  {[3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} members</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Cadence
                </label>
                <select
                  value={formData.cadence}
                  onChange={(e) => updateFormData('cadence', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  {cadenceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Day
                </label>
                <select
                  value={formData.preferredDay}
                  onChange={(e) => updateFormData('preferredDay', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="">Select a day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => updateFormData('preferredTime', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resource Links */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resource Links (Optional)
              </label>
              {formData.resourceLinks.map((link, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateResourceLink(index, e.target.value)}
                    placeholder="https://example.com/resource"
                    className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  />
                  {formData.resourceLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResourceLink(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addResourceLink}
                className="text-sm text-purple-400 hover:text-purple-300 transition"
              >
                + Add another resource
              </button>
            </div>

            {/* Submit */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                  isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white'
                    : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Mastermind'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
