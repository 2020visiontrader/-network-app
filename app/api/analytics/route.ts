import { NextResponse } from 'next/server'

// Force static generation for this route
export const dynamic = 'force-static'

// Default analytics data for static export
const staticAnalytics = {
  totalUsers: 0,
  activeUsers: 0,
  coffeeChats: 0,
  masterminds: 0,
  introductions: 0,
  events: 0,
  weeklyGrowth: 0,
  monthlyGrowth: 0,
  lastUpdated: new Date().toISOString()
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: staticAnalytics,
    note: 'This is static data. Real-time analytics are available at /.netlify/functions/api/analytics'
  })
}
