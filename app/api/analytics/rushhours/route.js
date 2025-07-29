import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get logs from the past 30 days for rush hour analysis
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const { data: logs, error } = await supabase
      .from('attendance_logs')
      .select('entry_time, exit_time')
      .gte('entry_time', startDate.toISOString())
      .lte('entry_time', endDate.toISOString())

    if (error) {
      console.error('Error fetching rush hours data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Initialize hourly data
    const hourlyData = Array(24).fill(0).map((_, hour) => ({
      hour: hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      count: 0,
      entries: 0,
      exits: 0
    }))

    // Process logs to calculate hourly activity
    logs?.forEach(log => {
      const entryHour = new Date(log.entry_time).getHours()
      hourlyData[entryHour].entries++
      hourlyData[entryHour].count++

      if (log.exit_time) {
        const exitHour = new Date(log.exit_time).getHours()
        hourlyData[exitHour].exits++
        hourlyData[exitHour].count++
      }
    })

    // Find peak hours
    const sortedHours = [...hourlyData].sort((a, b) => b.count - a.count)
    const peakHours = sortedHours.slice(0, 3).map(h => h.label)

    return NextResponse.json({
      hourlyData: hourlyData,
      peakHours: peakHours,
      totalLogs: logs?.length || 0
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}