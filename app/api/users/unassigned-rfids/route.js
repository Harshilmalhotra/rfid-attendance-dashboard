import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all RFID UIDs from attendance table that don't have a corresponding user
    const { data: unassignedRfids, error } = await supabase
      .from('attendance')
      .select('rfid_uid')
      .not('rfid_uid', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching unassigned RFIDs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get all assigned RFID UIDs from users table
    const { data: assignedUsers, error: usersError } = await supabase
      .from('users')
      .select('rfid_uid')
    
    if (usersError) {
      console.error('Error fetching assigned users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }
    
    // Filter out assigned RFIDs and get unique values
    const assignedRfidSet = new Set(assignedUsers.map(user => user.rfid_uid))
    const uniqueUnassignedRfids = [...new Set(unassignedRfids.map(record => record.rfid_uid))]
      .filter(rfid => !assignedRfidSet.has(rfid))
    
    return NextResponse.json({ rfids: uniqueUnassignedRfids })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}