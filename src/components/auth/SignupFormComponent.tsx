'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INDUSTRIES = [
  'Tech', 'AI', 'Web3', 'Finance', 'Ecommerce', 'SaaS', 'Education',
  'Wellness', 'Events', 'Fashion', 'Real Estate', 'Marketing', 'Creative',
  'Legal', 'Politics', 'Music Business', 'Content Creation', 'Venture Capital',
  'Coaching', 'Nonprofit'
]

const HOBBIES = [
  'Travel', 'Photography', 'Filmmaking', 'Fitness', 'Gaming', 'Meditation',
  'Cooking', 'Writing', 'Reading', 'Painting', 'Spirituality', 'Comedy',
  'Adventure Sports', 'Nature', 'Volunteering', 'Music', 'Design', 'Podcasting'
]

export default function SignupFormComponent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    website: '',
    dream: ''
  })
  const [selectedIndustries, setIndustries] = useState<string[]>([])
  const [selectedHobbies, setHobbies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const toggle = (list: string[], setList: any, value: string) => {
    setList((prev: string[]) =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value].slice(0, 3)
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        setError('Please fill in your name and email')
        return
      }

      if (selectedIndustries.length === 0) {
        setError('Please select at least one industry')
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // For demo purposes, redirect to thank you page
      router.push('/thank-you')
      
    } catch (error) {
      setError('Signup failed. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 bg-opacity-60 border border-zinc-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg max-h-[80vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 text-transparent bg-clip-text mb-2">
          Shape the Network
        </h2>
        <p className="text-gray-400 text-sm">
          Join our private ecosystem built for depth and meaningful connections
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="text-sm block text-gray-300">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Jordan Oram"
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm block text-gray-300">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="text-sm block text-gray-300">LinkedIn URL</label>
          <input 
            type="url" 
            id="linkedin" 
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/..."
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Industries */}
        <div>
          <label className="text-sm block mb-2 text-gray-300">Your Industry (pick up to 3)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {INDUSTRIES.map(industry => (
              <button 
                key={industry} 
                type="button"
                onClick={() => toggle(selectedIndustries, setIndustries, industry)}
                className={`px-3 py-1 rounded-full border text-xs transition ${
                  selectedIndustries.includes(industry)
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-zinc-800 text-gray-400 border-zinc-700 hover:border-purple-500'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Hobbies */}
        <div>
          <label className="text-sm block mb-2 text-gray-300">Your Hobbies (pick up to 3)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {HOBBIES.map(hobby => (
              <button 
                key={hobby} 
                type="button"
                onClick={() => toggle(selectedHobbies, setHobbies, hobby)}
                className={`px-3 py-1 rounded-full border text-xs transition ${
                  selectedHobbies.includes(hobby)
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-zinc-800 text-gray-400 border-zinc-700 hover:border-indigo-500'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* Reflective Question */}
        <div>
          <label htmlFor="dream" className="text-sm block mb-1 text-gray-300">
            What's your biggest professional goal right now?
          </label>
          <textarea
            id="dream"
            name="dream"
            value={formData.dream}
            onChange={handleInputChange}
            rows={3}
            placeholder="Write freely here..."
            className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-4 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Request Access'
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          We'll review your application and get back to you within 48 hours
        </p>
      </div>
    </div>
  )
}
