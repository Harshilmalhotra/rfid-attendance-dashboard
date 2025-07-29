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

    // Initialize data structure for each day
    const weekData = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      weekData.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        occupancy_count: 0
      })
    }

    // Fetch pre-calculated data from lab_occupancy table
    const { data: occupancyData, error } = await supabase
      .from('lab_occupancy')
      .select('date, occupancy_count, unique_visitors')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching weekly data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map the data to match frontend expectations
    const formattedData = weekData.map(day => {
      const dayData = occupancyData?.find(d => d.date === day.date)
      return {
        date: day.date,
        occupancy_count: dayData?.unique_visitors || dayData?.occupancy_count || 0,
        day: day.day
      }
    })

    // Return array directly as frontend expects
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}