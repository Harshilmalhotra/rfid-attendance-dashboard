'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import MigrationNotice from '@/components/MigrationNotice'

export default function ProtectedLayout({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    const checkUser = async () => {
      // Skip auth check only if auth is disabled AND not in production
      if (isAuthDisabled && !isProduction) {
        setLoading(false)
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
          router.push('/auth')
          return
        }

        if (!session) {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Always set up auth listener in production or when auth is enabled
    if (!isAuthDisabled || isProduction) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth')
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [router, isAuthDisabled, isProduction])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <MigrationNotice />
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </>
  )
}