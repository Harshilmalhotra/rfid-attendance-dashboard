import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.toISOString()
    
    // Get all attendance records for today
    const { data: todayAttendance, error } = await supabase
      .from('attendance')
      .select(`
        *,
        users (
          id,
          name,
          email,
          reg_number,
          role,
          rfid_uid
        )
      `)
      .gte('created_at', todayStart)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Process attendance to find who's currently in the lab
    const userStatus = new Map()
    
    // Process in reverse chronological order to get latest status for each user
    todayAttendance.forEach(record => {
      const rfidUid = record.rfid_uid
      if (!userStatus.has(rfidUid)) {
        userStatus.set(rfidUid, {
          status: record.Check,
          checkTime: record.created_at,
          user: record.users,
          rfidUid: rfidUid
        })
      }
    })
    
    // Filter to get only users who are currently checked IN
    const currentlyInLab = Array.from(userStatus.values())
      .filter(status => status.status === 'IN')
      .map(status => ({
        rfidUid: status.rfidUid,
        userName: status.user?.name || 'Unknown User',
        email: status.user?.email || '',
        regNumber: status.user?.reg_number || '',
        role: status.user?.role || 'member',
        checkInTime: status.checkTime,
        duration: calculateDuration(status.checkTime)
      }))
    
    // Get some statistics
    const stats = {
      currentOccupancy: currentlyInLab.length,
      byRole: {
        admin: currentlyInLab.filter(u => u.role === 'admin').length,
        lead: currentlyInLab.filter(u => u.role === 'lead').length,
        member: currentlyInLab.filter(u => u.role === 'member').length
      }
    }
    
    return NextResponse.json({
      currentlyInLab,
      stats,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateDuration(checkInTime) {
  const now = new Date()
  const checkIn = new Date(checkInTime)
  const diffMs = now - checkIn
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}