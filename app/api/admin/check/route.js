import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check if user is admin based on email
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('email')
      .eq('email', user.email.toLowerCase())
      .single()

    return NextResponse.json({ 
      isAdmin: !adminError && adminData !== null,
      email: user.email 
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}