import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin based on email
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('email')
      .eq('email', user.email.toLowerCase())
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Only admins can send broadcasts' }, { status: 403 })
    }

    // Get request body
    const { title, body, priority = 'normal', targetRoles = null } = await request.json()

    // Validate input
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    // Call the database function to send broadcast
    const { data, error } = await supabase
      .rpc('send_broadcast_notification', {
        p_sender_email: user.email,
        p_title: title,
        p_body: body,
        p_priority: priority
      })

    if (error) {
      console.error('Error sending broadcast:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Here you would typically trigger the actual push notifications
    // This could be done via:
    // 1. Supabase Edge Functions
    // 2. A separate notification service
    // 3. Web Push API from your backend

    // For now, we'll just simulate sending push notifications
    // In production, you'd integrate with a service like:
    // - Firebase Cloud Messaging
    // - OneSignal
    // - Web Push Protocol directly

    return NextResponse.json({ 
      success: true, 
      sentCount: data || 0,
      message: `Broadcast sent to ${data || 0} users`
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get broadcast history
export async function GET(request) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin based on email
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('email')
      .eq('email', user.email.toLowerCase())
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get broadcast history
    const { data: broadcasts, error } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching broadcasts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ broadcasts })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}