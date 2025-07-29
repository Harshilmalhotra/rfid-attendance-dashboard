import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching preferences:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ preferences: preferences || [] })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notification_type, enabled, push_enabled = true, email_enabled = false } = await request.json()

    if (!notification_type) {
      return NextResponse.json({ error: 'Notification type is required' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .eq('notification_type', notification_type)
      .single()

    let result
    if (existing) {
      result = await supabase
        .from('notification_preferences')
        .update({
          enabled,
          push_enabled,
          email_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          notification_type,
          enabled,
          push_enabled,
          email_enabled
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving preference:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ preference: result.data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}