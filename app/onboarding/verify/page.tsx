'use client'
import { useState } from 'react'
import Link from 'next/link'
import OnboardingProgress from '@/components/OnboardingProgress'

export default function OnboardingVerify() {
  const [formData, setFormData] = useState({
    linkedinUrl: '',
    workEmail: '',
    governmentId: null as File | null,
    proofOfInPerson: ''
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, governmentId: file }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="flex-1 flex flex-col">
      <OnboardingProgress 
        currentStep={1} 
        totalSteps={6} 
        stepTitle="Verify Your Identity" 
      />
      
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-2xl w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-8 backdrop-blur-md">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Identity & Trust Check</h2>
            <p className="text-gray-400">Help us verify you're a real person building real connections</p>
          </div>

          <form className="space-y-6">
            {/* LinkedIn Profile */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn Profile URL *
                <span className="text-xs text-gray-500 ml-2">(Used to verify professional background)</span>
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                required
              />
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Work Email (Optional)
                <span className="text-xs text-gray-500 ml-2">(We'll send a verification code)</span>
              </label>
              <input
                type="email"
                name="workEmail"
                value={formData.workEmail}
                onChange={handleInputChange}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
              />
            </div>

            {/* Government ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Government ID
                <span className="text-xs text-gray-500 ml-2">(Driver's license, passport, etc.)</span>
              </label>
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="governmentId"
                />
                <label htmlFor="governmentId" className="cursor-pointer">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {formData.governmentId ? formData.governmentId.name : 'Click to upload or drag and drop'}
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </label>
              </div>
            </div>

            {/* Proof of In-Person */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proof of In-Person Connection
                <span className="text-xs text-gray-500 ml-2">(Event photo or mutual connection)</span>
              </label>
              <textarea
                name="proofOfInPerson"
                value={formData.proofOfInPerson}
                onChange={handleInputChange}
                placeholder="e.g., 'Attended TechCrunch Disrupt 2023' or 'Mutual connection: John Smith at Acme Corp'"
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
              />
            </div>
          </form>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-700">
            <Link 
              href="/onboarding"
              className="px-6 py-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </Link>
            
            <div className="flex space-x-4">
              <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                Save & Exit
              </button>
              <Link 
                href="/onboarding/profile"
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
