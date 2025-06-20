import React from 'react'

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.svg" 
              className="h-8 w-8"
              alt="Network Monitor Logo"
            />
            <span className="text-xl font-semibold text-gray-800">Network Monitor</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Alerts</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Settings</a>
          </div>
        </div>
      </div>
    </nav>
  )
}