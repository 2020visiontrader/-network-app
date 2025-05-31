'use client'
import { useState, useEffect } from 'react'

interface TimeSlotPickerProps {
  selectedDate: string
  selectedTime: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
}

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '9:00 AM - 11:00 AM', icon: '🌅' },
  { id: 'midday', label: 'Midday', time: '11:00 AM - 2:00 PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '2:00 PM - 5:00 PM', icon: '🌤️' },
  { id: 'evening', label: 'Evening', time: '5:00 PM - 7:00 PM', icon: '🌆' }
]

export default function TimeSlotPicker({ selectedDate, selectedTime, onDateSelect, onTimeSelect }: TimeSlotPickerProps) {
  const [weekDays, setWeekDays] = useState<Array<{
    date: string
    dayName: string
    dayNumber: number
    isToday: boolean
    isPast: boolean
  }>>([])

  useEffect(() => {
    const generateWeekDays = () => {
      const today = new Date()
      const days = []
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        const dayNumber = date.getDate()
        const dateString = date.toISOString().split('T')[0]
        const isToday = i === 0
        const isPast = false // Since we're starting from today
        
        days.push({
          date: dateString,
          dayName,
          dayNumber,
          isToday,
          isPast
        })
      }
      
      setWeekDays(days)
    }

    generateWeekDays()
  }, [])

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getSelectedTimeLabel = (timeId: string) => {
    const slot = timeSlots.find(slot => slot.id === timeId)
    return slot ? `${slot.label} (${slot.time})` : ''
  }

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-amber-400 mb-6 flex items-center space-x-2">
        <span>📅</span>
        <span>When works for you?</span>
      </h3>

      {/* Date Selector */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-300 mb-4">Select a day</h4>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <button
              key={day.date}
              onClick={() => onDateSelect(day.date)}
              disabled={day.isPast}
              className={`p-3 rounded-lg text-center transition-all duration-200 ${
                selectedDate === day.date
                  ? 'bg-amber-500 text-black shadow-lg'
                  : day.isPast
                  ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                  : 'bg-zinc-800/50 text-white hover:bg-zinc-700 hover:border-amber-500/50 border border-zinc-700'
              }`}
            >
              <div className="text-xs font-medium mb-1">{day.dayName}</div>
              <div className="text-lg font-bold">{day.dayNumber}</div>
              {day.isToday && (
                <div className="text-xs text-amber-400 mt-1">Today</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Selector */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-4">Preferred time</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onTimeSelect(slot.id)}
              className={`p-4 rounded-lg text-left transition-all duration-200 ${
                selectedTime === slot.id
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-lg'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 hover:bg-zinc-800/70'
              } border`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{slot.icon}</span>
                <div>
                  <div className="font-semibold text-white">{slot.label}</div>
                  <div className="text-sm text-gray-400">{slot.time}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedDate || selectedTime) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-amber-400 mb-2">Your Selection</h4>
          <div className="space-y-1 text-sm">
            {selectedDate && (
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span className="text-white">{formatSelectedDate(selectedDate)}</span>
              </div>
            )}
            {selectedTime && (
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span className="text-white">{getSelectedTimeLabel(selectedTime)}</span>
              </div>
            )}
          </div>
          {selectedDate && selectedTime && (
            <div className="mt-3 text-xs text-gray-400">
              Perfect! We'll send both of you a confirmation with these details.
            </div>
          )}
        </div>
      )}

      {/* Helpful Tips */}
      <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
        <h5 className="text-sm font-medium text-gray-300 mb-2">💡 Pro Tips</h5>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Morning slots tend to have higher show-up rates</li>
          <li>• Midday works great for lunch meetings</li>
          <li>• Allow 60-90 minutes for meaningful conversations</li>
        </ul>
      </div>
    </div>
  )
}
