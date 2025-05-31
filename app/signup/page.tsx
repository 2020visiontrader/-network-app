'use client'
import { useState } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'

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

export default function SignupPage() {
  const [selectedIndustries, setIndustries] = useState<string[]>([])
  const [selectedHobbies, setHobbies] = useState<string[]>([])

  const toggle = (list: string[], setList: any, value: string) => {
    setList((prev: string[]) =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value].slice(0, 3)
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">

      {/* Interactive Hive Background */}
      <HiveHexGrid />

      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-800 opacity-20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-indigo-600 opacity-10 blur-2xl rotate-45" />

      {/* Signup Card */}
      <div className="relative z-10 max-w-3xl w-full bg-zinc-900 bg-opacity-60 border border-zinc-800 rounded-2xl shadow-lg p-10 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 text-transparent bg-clip-text mb-2 text-center">
          Shape the Network
        </h1>
        <p className="text-gray-400 text-sm text-center mb-10 max-w-xl mx-auto">
          This isn't another social feed. Network is a private, intelligent ecosystem built for depth.
          Tell us who you are — we'll connect you with aligned people, city hives, and moments that matter.
        </p>

        <form className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="text-sm block">Full Name</label>
            <input type="text" id="name" placeholder="Jordan Oram"
              className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm" />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm block">Email</label>
            <input type="email" id="email" placeholder="you@example.com"
              className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm" />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="text-sm block">LinkedIn URL</label>
            <input type="url" id="linkedin" placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm" />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="text-sm block">Business / Project Website</label>
            <input type="url" id="website" placeholder="https://yourproject.com"
              className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm" />
          </div>

          {/* Industries */}
          <div>
            <label className="text-sm block mb-2">Your Industry (pick up to 3)</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(industry => (
                <button key={industry} type="button"
                  onClick={() => toggle(selectedIndustries, setIndustries, industry)}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
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
            <label className="text-sm block mb-2 mt-6">Your Hobbies (pick up to 3)</label>
            <div className="flex flex-wrap gap-2">
              {HOBBIES.map(hobby => (
                <button key={hobby} type="button"
                  onClick={() => toggle(selectedHobbies, setHobbies, hobby)}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
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
          <div className="mt-6">
            <label htmlFor="dream" className="text-sm block mb-1">
              If money was no object, where would you be, what would you be doing, and who would you be with?
            </label>
            <textarea
              id="dream"
              rows={4}
              placeholder="Write freely here..."
              className="w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg placeholder-gray-500 text-sm"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 transition px-4 py-3 rounded-xl font-semibold text-white shadow-md"
          >
            Request Access
          </button>
        </form>
      </div>
    </main>
  )
}
