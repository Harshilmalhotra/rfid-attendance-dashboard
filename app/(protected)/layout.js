'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import MigrationNotice from '@/components/MigrationNotice'
import SessionRefresh from '@/components/SessionRefresh'
import { Box, CircularProgress } from '@mui/material'

export default function ProtectedLayout({ children }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    // Skip auth check only if auth is disabled AND not in production
    if (isAuthDisabled && !isProduction) {
      return
    }

    // If not loading and no user, redirect to auth
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router, isAuthDisabled, isProduction])

  // Show loading state
  if (loading && (!isAuthDisabled || isProduction)) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Don't render protected content if not authenticated (unless auth is disabled in development)
  if (!user && (!isAuthDisabled || isProduction)) {
    return null
  }

  return (
    <>
      <SessionRefresh />
      <MigrationNotice />
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto md:ml-[72px]">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </>
  )
}