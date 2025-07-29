import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('attendance')
      .select(`
        *,
        users (
          id,
          name,
          email,
          reg_number,
          role
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    if (userId && userId !== 'all') {
      query = query.eq('rfid_uid', userId)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching attendance logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by check type if needed
    let filteredLogs = logs || []
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => {
        return log.Check === status
      })
    }

    // Format the response
    const formattedLogs = filteredLogs.map(log => ({
      id: log.id,
      rfidUid: log.rfid_uid,
      userName: log.users?.name || 'Unknown',
      email: log.users?.email || '',
      regNumber: log.users?.reg_number || '',
      role: log.users?.role || 'member',
      checkTime: log.created_at,
      checkType: log.Check || 'Unknown'
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
    const supabase = await createClient()

    const body = await request.json()
    const { rfidUid, checkType } = body

    if (!rfidUid || !checkType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        rfid_uid: rfidUid,
        Check: checkType,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating attendance record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, attendance: data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

