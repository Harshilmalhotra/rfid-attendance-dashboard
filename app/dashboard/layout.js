'use client'

import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import { Box } from '@mui/material'

export default function DashboardLayout({ children }) {
  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <MobileNavigation />
      </Box>
      <div className="flex">
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Sidebar />
        </Box>
        <main className="flex-1 overflow-auto md:ml-[72px]">
          {children}
        </main>
      </div>
    </>
  )
}