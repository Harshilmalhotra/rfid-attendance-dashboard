import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing database connection...')
    const supabase = await createClient()
    
    // Test 1: Simple count query
    const { count: userCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ 
        error: 'Count query failed',
        details: countError 
      }, { status: 500 })
    }
    
    // Test 2: Fetch first 5 users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, rfid_uid, name, email, role')
      .limit(5)
    
    if (usersError) {
      console.error('Users query error:', usersError)
      return NextResponse.json({ 
        error: 'Users query failed',
        details: usersError 
      }, { status: 500 })
    }
    
    // Test 3: Check attendance table structure
    const { data: attendanceTest, error: attendanceError } = await supabase
      .from('attendance')
      .select('rfid_uid')
      .limit(1)
    
    if (attendanceError) {
      console.error('Attendance query error:', attendanceError)
    }
    
    // Test 4: Check for any users without rfid_uid
    const { data: usersWithoutRfid, error: noRfidError } = await supabase
      .from('users')
      .select('id, name')
      .is('rfid_uid', null)
    
    return NextResponse.json({
      success: true,
      tests: {
        userCount,
        sampleUsers: users,
        usersWithoutRfid: usersWithoutRfid || [],
        attendanceTableAccessible: !attendanceError,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}