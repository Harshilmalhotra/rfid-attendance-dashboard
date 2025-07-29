import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    
    const { notification_type, title, body, data = {} } = await request.json()

    if (!notification_type || !title || !body) {
      return NextResponse.json({ 
        error: 'notification_type, title, and body are required' 
      }, { status: 400 })
    }

    // Get users who have enabled this notification type
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('notification_type', notification_type)
      .eq('enabled', true)
      .eq('push_enabled', true)

    if (prefError) {
      console.error('Error fetching preferences:', prefError)
      return NextResponse.json({ error: prefError.message }, { status: 500 })
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users have enabled this notification type',
        sent_count: 0 
      })
    }

    const userIds = preferences.map(p => p.user_id)

    // Get push subscriptions for these users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    // In a real implementation, you would send push notifications here
    // using web-push library or a service like Firebase Cloud Messaging
    
    // For now, we'll store the notification in the database
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        type: notification_type,
        title,
        body,
        data,
        recipient_count: subscriptions?.length || 0,
        created_at: new Date().toISOString()
      })

    if (notifError) {
      console.error('Error storing notification:', notifError)
    }

    return NextResponse.json({ 
      success: true,
      message: `Notification queued for ${subscriptions?.length || 0} users`,
      sent_count: subscriptions?.length || 0
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}