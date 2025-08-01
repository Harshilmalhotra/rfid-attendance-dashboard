'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Dashboard,
  Assignment,
  People,
  Person,
  Menu as MenuIcon,
  Close,
  ExitToApp,
  Settings,
  Brightness4,
  Brightness7,
  Notifications,
  Campaign,
  AdminPanelSettings
} from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { useColorMode } from '@/context/ColorModeContext'
import { supabase } from '@/lib/supabase'

const publicNavigationItems = [
  { label: 'Dashboard', value: '/dashboard', icon: <Dashboard /> },
]

const protectedNavigationItems = [
  { label: 'Attendance', value: '/attendance', icon: <Assignment /> },
  { label: 'Users', value: '/users', icon: <People /> },
  { label: 'Profile', value: '/profile', icon: <Person /> },
  { label: 'Notifications', value: '/notifications', icon: <Notifications /> },
]

export default function MobileNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  useEffect(() => {
    // Check if user is admin based on email
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('admin')
            .select('email')
            .eq('email', user.email.toLowerCase())
            .maybeSingle()
          
          setIsAdmin(!error && data !== null)
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        }
      }
    }
    
    checkAdminStatus()
  }, [user])
  
  // Add broadcast and admin management pages for admins only
  const adminNavigationItems = isAdmin ? [
    { label: 'Broadcast', value: '/broadcast', icon: <Campaign /> },
    { label: 'Admin Management', value: '/admin-management', icon: <AdminPanelSettings /> },
  ] : []
  
  const navigationItems = user 
    ? [...publicNavigationItems, ...protectedNavigationItems, ...adminNavigationItems] 
    : publicNavigationItems
  
  // Only render on mobile screens
  if (!isMobile) {
    return null
  }

  const handleNavigation = (path) => {
    router.push(path)
  }

  const currentPath = navigationItems.find(item => pathname === item.value)?.value || '/dashboard'

  return (
    <>
      {/* Mobile App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { xs: 'block', md: 'none' },
          top: 0,
          zIndex: 1100
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Lab Attendance
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            sx={{ mr: 1 }}
          >
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
          <Avatar sx={{ width: 32, height: 32 }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, height: 56 }} />

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          
          <Divider />
          
          <List sx={{ flexGrow: 1 }}>
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.value}
                onClick={() => {
                  handleNavigation(item.value)
                  setDrawerOpen(false)
                }}
                selected={pathname === item.value}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          <List>
            <ListItem button onClick={toggleColorMode}>
              <ListItemIcon>
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </ListItemIcon>
              <ListItemText primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'} />
            </ListItem>
            <ListItem button>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            {user ? (
              <ListItem button onClick={signOut}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItem>
            ) : (
              <ListItem button onClick={() => { router.push('/auth'); setDrawerOpen(false); }}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Sign In" />
              </ListItem>
            )}
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          display: { xs: 'block', md: 'none' },
          zIndex: 1100
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={currentPath}
          onChange={(event, newValue) => {
            handleNavigation(newValue)
          }}
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Spacer for fixed bottom navigation */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, height: 56 }} />
    </>
  )
}