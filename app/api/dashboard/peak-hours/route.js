import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30') // Default to last 30 days
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Fetch hourly occupancy data
    const { data: hourlyData, error } = await supabase
      .from('hourly_occupancy')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('hour', { ascending: true })
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
      console.error('Error fetching hourly occupancy:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // If no data in hourly_occupancy table, calculate from attendance records
    if (!hourlyData || hourlyData.length === 0) {
      return await calculateFromAttendance(supabase, startDate, endDate)
    }
    
    // Group by hour and calculate averages
    const hourlyAverages = {}
    for (let hour = 8; hour <= 20; hour++) {
      hourlyAverages[hour] = {
        hour,
        avgOccupancy: 0,
        maxOccupancy: 0,
        dataPoints: 0
      }
    }
    
    hourlyData.forEach(record => {
      if (record.hour >= 8 && record.hour <= 20) {
        if (!hourlyAverages[record.hour]) {
          hourlyAverages[record.hour] = {
            hour: record.hour,
            avgOccupancy: 0,
            maxOccupancy: 0,
            dataPoints: 0
          }
        }
        hourlyAverages[record.hour].avgOccupancy += record.avg_occupancy
        hourlyAverages[record.hour].maxOccupancy = Math.max(
          hourlyAverages[record.hour].maxOccupancy,
          record.max_occupancy
        )
        hourlyAverages[record.hour].dataPoints += 1
      }
    })
    
    // Calculate final averages
    const chartData = Object.values(hourlyAverages).map(hourData => ({
      hour: hourData.hour,
      time: `${hourData.hour}:00`,
      avgOccupancy: hourData.dataPoints > 0 
        ? Math.round(hourData.avgOccupancy / hourData.dataPoints * 10) / 10
        : 0,
      maxOccupancy: hourData.maxOccupancy
    }))
    
    // Find peak hour
    const peakHour = chartData.reduce((peak, current) => 
      current.avgOccupancy > peak.avgOccupancy ? current : peak
    , chartData[0])
    
    return NextResponse.json({
      chartData,
      peakHour: {
        hour: peakHour.hour,
        time: peakHour.time,
        avgOccupancy: peakHour.avgOccupancy
      },
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Calculate from attendance records if hourly_occupancy table is empty
async function calculateFromAttendance(supabase, startDate, endDate) {
  try {
    // Fetch all attendance records in date range
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Group by date and hour
    const hourlyOccupancy = {}
    const userStatus = new Map() // Track user status at each hour
    
    // Initialize hourly data structure
    for (let hour = 8; hour <= 20; hour++) {
      hourlyOccupancy[hour] = {
        hour,
        time: `${hour}:00`,
        totalOccupancy: 0,
        days: new Set(),
        maxOccupancy: 0
      }
    }
    
    // Process attendance records
    attendance.forEach(record => {
      const recordDate = new Date(record.created_at)
      const hour = recordDate.getHours()
      const dateKey = recordDate.toISOString().split('T')[0]
      
      if (hour >= 8 && hour <= 20) {
        // Update user status
        if (!userStatus.has(dateKey)) {
          userStatus.set(dateKey, new Map())
        }
        
        const dayStatus = userStatus.get(dateKey)
        
        // Count current occupancy for this hour
        let currentOccupancy = 0
        dayStatus.forEach((status, rfid) => {
          if (status === 'IN') currentOccupancy++
        })
        
        // Update status for this user
        dayStatus.set(record.rfid_uid, record.Check)
        
        // Update occupancy after this check
        if (record.Check === 'IN') {
          currentOccupancy++
        }
        
        // Update hourly data
        hourlyOccupancy[hour].totalOccupancy += currentOccupancy
        hourlyOccupancy[hour].days.add(dateKey)
        hourlyOccupancy[hour].maxOccupancy = Math.max(
          hourlyOccupancy[hour].maxOccupancy,
          currentOccupancy
        )
      }
    })
    
    // Calculate averages
    const chartData = Object.values(hourlyOccupancy).map(hourData => ({
      hour: hourData.hour,
      time: hourData.time,
      avgOccupancy: hourData.days.size > 0 
        ? Math.round((hourData.totalOccupancy / hourData.days.size) * 10) / 10
        : 0,
      maxOccupancy: hourData.maxOccupancy
    }))
    
    // Find peak hour
    const peakHour = chartData.reduce((peak, current) => 
      current.avgOccupancy > peak.avgOccupancy ? current : peak
    , chartData[0])
    
    return NextResponse.json({
      chartData,
      peakHour: {
        hour: peakHour.hour,
        time: peakHour.time,
        avgOccupancy: peakHour.avgOccupancy
      },
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      calculatedFromRaw: true
    })
  } catch (error) {
    console.error('Error calculating from attendance:', error)
    return NextResponse.json({ error: 'Failed to calculate peak hours' }, { status: 500 })
  }
}