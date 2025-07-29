import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ 
        error: 'Auth error',
        details: authError.message,
        authError 
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        authError: null 
      }, { status: 401 })
    }

    // Try to query the notification_preferences table
    const { data: preferences, error: prefError, count } = await supabase
      .from('notification_preferences')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Check if table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['notification_preferences', 'push_subscriptions', 'notifications'])

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      preferences: {
        data: preferences,
        error: prefError,
        count
      },
      tables_exist: tables?.map(t => t.table_name) || [],
      debug_info: {
        auth_header: user.aud,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}