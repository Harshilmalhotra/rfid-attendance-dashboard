import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get date range for the past 7 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)

    // Fetch attendance logs for the past week
    const { data: logs, error } = await supabase
      .from('attendance_logs')
      .select('entry_time, exit_time')
      .gte('entry_time', startDate.toISOString())
      .lte('entry_time', endDate.toISOString())

    if (error) {
      console.error('Error fetching weekly data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Initialize data structure for each day
    const weekData = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      weekData.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        occupancy: 0,
        uniqueUsers: new Set()
      })
    }

    // Process logs to calculate daily occupancy
    logs?.forEach(log => {
      const entryDate = new Date(log.entry_time)
      const dayIndex = Math.floor((entryDate - startDate) / (1000 * 60 * 60 * 24))
      
      if (dayIndex >= 0 && dayIndex < 7) {
        weekData[dayIndex].occupancy++
        // In a real app, you'd track unique users here
      }
    })

    // Format response
    const formattedData = weekData.map(day => ({
      day: day.day,
      date: day.date,
      occupancy: day.occupancy,
      uniqueUsers: day.uniqueUsers.size
    }))

    return NextResponse.json({
      weeklyData: formattedData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}