'use client'
import { useState } from 'react'
import HiveHexGrid from '@/components/HiveHexGrid'
import ContactSelector from '@/components/coffee-chat/ContactSelector'
import TimeSlotPicker from '@/components/coffee-chat/TimeSlotPicker'
import AgendaInput from '@/components/coffee-chat/AgendaInput'
import ConfirmationToast from '@/components/coffee-chat/ConfirmationToast'

interface CoffeeChatData {
  selectedContact: any | null
  selectedDate: string
  selectedTime: string
  location: string
  agendaBullets: string[]
}

export default function CoffeeChatPage() {
  const [chatData, setChatData] = useState<CoffeeChatData>({
    selectedContact: null,
    selectedDate: '',
    selectedTime: '',
    location: '',
    agendaBullets: ['', '', '']
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateChatData = (field: keyof CoffeeChatData, value: any) => {
    setChatData(prev => ({ ...prev, [field]: value }))
  }

  const handleConfirm = async () => {
    if (!chatData.selectedContact || !chatData.selectedDate || !chatData.selectedTime) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show confirmation
      setShowConfirmation(true)
      
      // Reset form after delay
      setTimeout(() => {
        setShowConfirmation(false)
        setChatData({
          selectedContact: null,
          selectedDate: '',
          selectedTime: '',
          location: '',
          agendaBullets: ['', '', '']
        })
      }, 3000)
    } catch (error) {
      console.error('Failed to schedule coffee chat:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = chatData.selectedContact && chatData.selectedDate && chatData.selectedTime

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-amber-950/10 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text mb-4">
            Let's Meet for Coffee
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Real connections. One chat at a time.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Panel - Contact & Location */}
          <div className="space-y-6">
            <ContactSelector 
              selectedContact={chatData.selectedContact}
              onContactSelect={(contact) => updateChatData('selectedContact', contact)}
            />
            
            {/* Location Input */}
            <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center space-x-2">
                <span>📍</span>
                <span>Where do you want to meet?</span>
              </h3>
              <input
                type="text"
                value={chatData.location}
                onChange={(e) => updateChatData('location', e.target.value)}
                placeholder="Preferred café, coworking space, or venue"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Optional - You can decide together later
              </p>
            </div>
          </div>

          {/* Right Panel - Time & Agenda */}
          <div className="space-y-6">
            <TimeSlotPicker
              selectedDate={chatData.selectedDate}
              selectedTime={chatData.selectedTime}
              onDateSelect={(date) => updateChatData('selectedDate', date)}
              onTimeSelect={(time) => updateChatData('selectedTime', time)}
            />
            
            <AgendaInput
              agendaBullets={chatData.agendaBullets}
              onBulletsChange={(bullets) => updateChatData('agendaBullets', bullets)}
            />
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="text-center mt-10">
          <button
            onClick={handleConfirm}
            disabled={!isFormValid || isSubmitting}
            className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              isFormValid && !isSubmitting
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500 shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transform hover:scale-105'
                : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Scheduling...</span>
              </div>
            ) : (
              'Confirm Coffee Chat'
            )}
          </button>
          
          {!isFormValid && (
            <p className="text-sm text-gray-500 mt-3">
              Please select a contact, date, and time to continue
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Toast */}
      {showConfirmation && (
        <ConfirmationToast 
          contactName={chatData.selectedContact?.name}
          date={chatData.selectedDate}
          time={chatData.selectedTime}
        />
      )}
    </main>
  )
}
