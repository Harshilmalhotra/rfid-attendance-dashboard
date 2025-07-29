import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '7ad4019b-bdd8-4f28-9f7d-a70ad201adf2'
    
    const supabase = await createServiceClient()
    
    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    // Check if tables exist
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['notification_preferences', 'push_subscriptions', 'users'])
    
    // Try to insert a test preference
    let testInsert = null
    if (authUser) {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          notification_type: 'test_notification',
          enabled: true,
          push_enabled: true,
          email_enabled: false
        }, {
          onConflict: 'user_id,notification_type'
        })
        .select()
        
      testInsert = { data, error }
    }
    
    return NextResponse.json({
      userId,
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at
      } : null,
      authError: authError?.message,
      existingTables: tables?.map(t => t.table_name) || [],
      testInsert
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