'use client'
import { useState } from 'react'
import Link from 'next/link'
import OnboardingProgress from '@/components/OnboardingProgress'

export default function OnboardingProfile() {
  const [formData, setFormData] = useState({
    photos: [] as File[],
    tagline: ''
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ 
      ...prev, 
      photos: [...prev.photos, ...files].slice(0, 5) 
    }))
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleTaglineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 120) {
      setFormData(prev => ({ ...prev, tagline: value }))
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <OnboardingProgress 
        currentStep={2} 
        totalSteps={6} 
        stepTitle="Visual Profile & Tagline" 
      />
      
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-2xl w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-8 backdrop-blur-md">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Show Your Best Self</h2>
            <p className="text-gray-400">Upload photos and craft a memorable tagline</p>
          </div>

          <form className="space-y-8">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Profile Photos (3-5 recommended)
                <span className="text-xs text-gray-500 ml-2">(Professional headshot + lifestyle photos)</span>
              </label>
              
              {/* Photo Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Upload Slot */}
                {formData.photos.length < 5 && (
                  <div className="aspect-square border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photos"
                    />
                    <label htmlFor="photos" className="cursor-pointer text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-xs text-gray-500">Add Photo</p>
                    </label>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                First photo will be your main profile picture. JPG, PNG up to 5MB each.
              </p>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Tagline
                <span className="text-xs text-gray-500 ml-2">(What you're building or passionate about)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.tagline}
                  onChange={handleTaglineChange}
                  placeholder="e.g., Building for bold communities in emerging markets."
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {formData.tagline.length}/120
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This appears under your name in introductions and search results.
              </p>
            </div>

            {/* Preview Card */}
            {(formData.photos.length > 0 || formData.tagline) && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Preview</h3>
                <div className="flex items-start space-x-4">
                  {formData.photos.length > 0 && (
                    <img 
                      src={URL.createObjectURL(formData.photos[0])} 
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Your Name</h4>
                    {formData.tagline && (
                      <p className="text-sm text-gray-400 mt-1">{formData.tagline}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-700">
            <Link 
              href="/onboarding/verify"
              className="px-6 py-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </Link>
            
            <div className="flex space-x-4">
              <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                Save & Exit
              </button>
              <Link 
                href="/onboarding/expertise"
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
