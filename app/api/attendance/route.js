import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('attendance_logs')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          department
        )
      `)
      .order('entry_time', { ascending: false })

    // Apply filters
    if (startDate) {
      query = query.gte('entry_time', startDate)
    }
    if (endDate) {
      query = query.lte('entry_time', endDate)
    }
    if (userId && userId !== 'all') {
      query = query.eq('user_id', userId)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching attendance logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by status if needed
    let filteredLogs = logs || []
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => {
        const logStatus = log.exit_time ? 'completed' : 'active'
        return logStatus === status
      })
    }

    // Format the response
    const formattedLogs = filteredLogs.map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.profiles?.full_name || 'Unknown',
      email: log.profiles?.email || '',
      department: log.profiles?.department || 'Not specified',
      entryTime: log.entry_time,
      exitTime: log.exit_time,
      duration: calculateDuration(log.entry_time, log.exit_time),
      status: log.exit_time ? 'completed' : 'active'
    }))

    return NextResponse.json({
      logs: formattedLogs,
      total: formattedLogs.length
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'entry') {
      // Create new attendance log entry
      const { data, error } = await supabase
        .from('attendance_logs')
        .insert({
          user_id: userId,
          entry_time: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating entry log:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, log: data })
    } else if (action === 'exit') {
      // Find the latest entry without exit time
      const { data: activeLog, error: findError } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', userId)
        .is('exit_time', null)
        .order('entry_time', { ascending: false })
        .limit(1)
        .single()

      if (findError || !activeLog) {
        return NextResponse.json({ error: 'No active entry found' }, { status: 404 })
      }

      // Update with exit time
      const { data, error } = await supabase
        .from('attendance_logs')
        .update({ exit_time: new Date().toISOString() })
        .eq('id', activeLog.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating exit time:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, log: data })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateDuration(entryTime, exitTime) {
  if (!exitTime) {
    const now = new Date()
    const entry = new Date(entryTime)
    const diffMs = now - entry
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m (ongoing)`
  }
  
  const entry = new Date(entryTime)
  const exit = new Date(exitTime)
  const diffMs = exit - entry
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}