import React from 'react'
import Navigation from './components/Navigation'
import StatusCard from './components/StatusCard'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <main className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Network Monitoring Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Network Uptime"
            value="99.98%"
            status="normal"
          />
          <StatusCard
            title="Active Devices"
            value="142"
            status="warning"
          />
          <StatusCard
            title="Avg Latency"
            value="48ms"
            status="critical"
          />
        </div>
      </main>
    </div>
  )
}