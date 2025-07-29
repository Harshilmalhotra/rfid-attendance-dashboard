import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get current occupants (users who have entered but not exited)
    const { data: currentOccupants, error } = await supabase
      .from('attendance_logs')
      .select(`
        id,
        user_id,
        entry_time,
        profiles (
          id,
          full_name,
          email,
          department
        )
      `)
      .is('exit_time', null)
      .order('entry_time', { ascending: false })

    if (error) {
      console.error('Error fetching current occupants:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the response
    const formattedOccupants = currentOccupants?.map(log => ({
      id: log.id,
      userId: log.user_id,
      name: log.profiles?.full_name || 'Unknown',
      email: log.profiles?.email || '',
      department: log.profiles?.department || 'Not specified',
      entryTime: log.entry_time,
      duration: calculateDuration(log.entry_time)
    })) || []

    return NextResponse.json({
      occupants: formattedOccupants,
      count: formattedOccupants.length
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateDuration(entryTime) {
  const now = new Date()
  const entry = new Date(entryTime)
  const diffMs = now - entry
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}