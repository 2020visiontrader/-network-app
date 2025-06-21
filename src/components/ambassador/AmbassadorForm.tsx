'use client'
import { useState } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'

interface AmbassadorFormProps {
  onClose: () => void
  onSubmit: (data: ApplicationData) => void
}

interface ApplicationData {
  motivation: string
  expectedInvites: number
  communityLinks: string[]
}

export default function AmbassadorForm({ onClose, onSubmit }: AmbassadorFormProps) {
  const [formData, setFormData] = useState<ApplicationData>({
    motivation: '',
    expectedInvites: 5,
    communityLinks: ['']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const updateFormData = (field: keyof ApplicationData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCommunityLink = () => {
    updateFormData('communityLinks', [...formData.communityLinks, ''])
  }

  const updateCommunityLink = (index: number, value: string) => {
    const newLinks = [...formData.communityLinks]
    newLinks[index] = value
    updateFormData('communityLinks', newLinks)
  }

  const removeCommunityLink = (index: number) => {
    updateFormData('communityLinks', formData.communityLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowSuccess(true)
      
      setTimeout(() => {
        onSubmit(formData)
      }, 2000)
    } catch (error) {
      console.error('Failed to submit application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.motivation.trim().length >= 50

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <HiveHexGrid />
        <div className="relative z-10 bg-zinc-900/95 border border-green-500/50 rounded-2xl p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Application Received! 🌟</h3>
          <p className="text-gray-300">We'll notify you within 72 hours.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <HiveHexGrid />
      
      <div className="relative z-10 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 text-transparent bg-clip-text">
                Apply to Become a Network Ambassador
              </h2>
              <p className="text-gray-400 mt-2">Help us grow the most trusted professional network</p>
            </div>
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
            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Why do you want to become an Ambassador? *
              </label>
              <textarea
                value={formData.motivation}
                onChange={(e) => updateFormData('motivation', e.target.value)}
                placeholder="Share your vision for growing the Network and how you'd contribute to our community..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
                required
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${formData.motivation.length >= 50 ? 'text-green-400' : 'text-gray-500'}`}>
                  {formData.motivation.length}/500 characters (minimum 50)
                </span>
                {formData.motivation.length >= 50 && (
                  <span className="text-xs text-green-400">✓ Looks good!</span>
                )}
              </div>
            </div>

            {/* Expected Invites */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How many trusted founders would you invite? *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 8, 10, 15].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateFormData('expectedInvites', num)}
                    className={`p-3 rounded-lg text-center transition ${
                      formData.expectedInvites === num
                        ? 'bg-purple-600 text-white border border-purple-400'
                        : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="font-semibold">{num}</div>
                    <div className="text-xs">people</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Quality over quantity - we value thoughtful referrals
              </p>
            </div>

            {/* Community Links */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Previous communities you've led (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Share links to communities, groups, or organizations you've helped grow
              </p>
              
              {formData.communityLinks.map((link, index) => (
                <div key={index} className="flex space-x-2 mb-3">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateCommunityLink(index, e.target.value)}
                    placeholder="https://example.com/community or LinkedIn group URL"
                    className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  />
                  {formData.communityLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCommunityLink(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              {formData.communityLinks.length < 3 && (
                <button
                  type="button"
                  onClick={addCommunityLink}
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  + Add another community link
                </button>
              )}
            </div>

            {/* Ambassador Responsibilities */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Ambassador Responsibilities</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Invite high-quality professionals who align with Network values</li>
                <li>• Maintain a 70%+ approval rate for your referrals</li>
                <li>• Participate in ambassador feedback sessions</li>
                <li>• Help onboard new members and answer questions</li>
                <li>• Represent Network positively in professional settings</li>
              </ul>
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
                    ? 'bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black'
                    : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
