'use client'
import { useState } from 'react'
import Link from 'next/link'
import OnboardingProgress from '@/components/OnboardingProgress'

export default function OnboardingImport() {
  const [importMethod, setImportMethod] = useState<'google' | 'csv' | 'manual' | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [manualContacts, setManualContacts] = useState([
    { name: '', email: '', relationship: '' }
  ])

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
    }
  }

  const addManualContact = () => {
    setManualContacts([...manualContacts, { name: '', email: '', relationship: '' }])
  }

  const updateManualContact = (index: number, field: string, value: string) => {
    const updated = manualContacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    )
    setManualContacts(updated)
  }

  const removeManualContact = (index: number) => {
    setManualContacts(manualContacts.filter((_, i) => i !== index))
  }

  return (
    <div className="flex-1 flex flex-col">
      <OnboardingProgress 
        currentStep={5} 
        totalSteps={6} 
        stepTitle="Network Import" 
      />
      
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-3xl w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-xl p-8 backdrop-blur-md">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Import Your Network</h2>
            <p className="text-gray-400">Connect with people you already know on Network</p>
          </div>

          <div className="space-y-6">
            {/* Import Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose Import Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'google',
                    title: '📧 Google Contacts',
                    desc: 'Import from Gmail contacts',
                    recommended: true
                  },
                  {
                    id: 'csv',
                    title: '📄 CSV Upload',
                    desc: 'Upload a contacts file',
                    recommended: false
                  },
                  {
                    id: 'manual',
                    title: '✋ Manual Entry',
                    desc: 'Add contacts manually',
                    recommended: false
                  }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setImportMethod(method.id as any)}
                    className={`p-6 rounded-lg border text-left transition relative ${
                      importMethod === method.id
                        ? 'bg-purple-600/20 text-white border-purple-400'
                        : 'bg-zinc-800/50 text-gray-400 border-zinc-700 hover:border-purple-500'
                    }`}
                  >
                    {method.recommended && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                    <div className="font-medium text-base mb-2">{method.title}</div>
                    <div className="text-sm opacity-75">{method.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Google Contacts */}
            {importMethod === 'google' && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="font-medium text-white mb-4">Connect Google Contacts</h3>
                <p className="text-sm text-gray-400 mb-6">
                  We'll securely access your Google contacts to find mutual connections on Network. 
                  Your contact data is never stored permanently.
                </p>
                <button className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Connect with Google</span>
                </button>
              </div>
            )}

            {/* CSV Upload */}
            {importMethod === 'csv' && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="font-medium text-white mb-4">Upload CSV File</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Upload a CSV file with columns: Name, Email, Company (optional)
                </p>
                
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csvFile"
                  />
                  <label htmlFor="csvFile" className="cursor-pointer">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {csvFile ? csvFile.name : 'Click to upload CSV file'}
                    </div>
                    <p className="text-xs text-gray-500">CSV files up to 5MB</p>
                  </label>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {importMethod === 'manual' && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="font-medium text-white mb-4">Add Contacts Manually</h3>
                <div className="space-y-4">
                  {manualContacts.map((contact, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={contact.name}
                        onChange={(e) => updateManualContact(index, 'name', e.target.value)}
                        className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) => updateManualContact(index, 'email', e.target.value)}
                        className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Relationship"
                        value={contact.relationship}
                        onChange={(e) => updateManualContact(index, 'relationship', e.target.value)}
                        className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeManualContact(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition text-sm"
                        disabled={manualContacts.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addManualContact}
                    className="text-purple-400 hover:text-purple-300 transition text-sm"
                  >
                    + Add Another Contact
                  </button>
                </div>
              </div>
            )}

            {/* Skip Option */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Don't want to import contacts right now?
              </p>
              <button className="text-purple-400 hover:text-purple-300 transition text-sm underline">
                Skip this step - I'll add contacts later
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-700">
            <Link 
              href="/onboarding/connect"
              className="px-6 py-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </Link>
            
            <div className="flex space-x-4">
              <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                Save & Exit
              </button>
              <Link 
                href="/onboarding/complete"
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
