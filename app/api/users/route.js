import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    console.log('GET /api/users - Starting request')
    // Use service client to bypass RLS for admin operations
    const supabase = await createServiceClient()
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    
    console.log('Query params:', { search, role })
    
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,reg_number.ilike.%${search}%,rfid_uid.ilike.%${search}%`)
    }
    
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }
    
    const { data: users, error } = await query
    
    if (error) {
      console.error('Supabase error fetching users:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    console.log(`Successfully fetched ${users?.length || 0} users`)
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Server error in GET /api/users:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Remove any undefined or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
        delete updateData[key]
      }
    })
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('users')
      .insert(body)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}