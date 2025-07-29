import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const rfidUid = searchParams.get('rfid_uid')
    const checkType = searchParams.get('check_type')
    const userName = searchParams.get('user_name')
    const regNumber = searchParams.get('reg_number')
    const limit = searchParams.get('limit') || 100
    const offset = searchParams.get('offset') || 0

    // Build query
    let query = supabase
      .from('attendance')
      .select(`
        *,
        users!inner (
          id,
          name,
          email,
          reg_number,
          role,
          phone_number
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply filters
    if (startDate) {
      // Start of the day
      const startOfDay = new Date(startDate)
      startOfDay.setHours(0, 0, 0, 0)
      query = query.gte('created_at', startOfDay.toISOString())
    }
    if (endDate) {
      // End of the day (23:59:59.999)
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      query = query.lte('created_at', endOfDay.toISOString())
    }
    if (rfidUid) {
      query = query.eq('rfid_uid', rfidUid)
    }
    if (checkType && checkType !== 'all') {
      query = query.eq('Check', checkType)
    }
    if (userName) {
      query = query.ilike('users.name', `%${userName}%`)
    }
    if (regNumber) {
      query = query.eq('users.reg_number', regNumber)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Error fetching attendance logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the response
    const formattedLogs = logs.map(log => ({
      id: log.id,
      rfidUid: log.rfid_uid,
      userName: log.users?.name || 'Unknown',
      email: log.users?.email || '',
      regNumber: log.users?.reg_number || '',
      role: log.users?.role || 'member',
      phoneNumber: log.users?.phone_number || '',
      checkTime: log.created_at,
      checkType: log.Check || 'Unknown'
    }))

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      attendance: formattedLogs,
      total: totalCount || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}