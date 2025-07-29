'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  GetApp,
  Close,
  PhoneIphone,
  Computer,
  CheckCircle
} from '@mui/icons-material'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [showIOSDialog, setShowIOSDialog] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after 30 seconds on first visit
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompted')
      if (!hasSeenPrompt && isMobile) {
        setTimeout(() => {
          setShowInstallDialog(true)
          localStorage.setItem('pwa-install-prompted', 'true')
        }, 30000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if iOS and not installed
    if (isIOS && !isInstalled) {
      const hasSeenIOSPrompt = localStorage.getItem('pwa-ios-prompted')
      if (!hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowIOSDialog(true)
          localStorage.setItem('pwa-ios-prompted', 'true')
        }, 30000)
      }
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowSuccess(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isMobile, isIOS, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSDialog(true)
      }
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstallDialog(false)
  }

  const InstallButton = () => {
    if (isInstalled) return null

    return (
      <Button
        variant="contained"
        startIcon={<GetApp />}
        onClick={() => isIOS ? setShowIOSDialog(true) : setShowInstallDialog(true)}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 70 : 20,
          right: 20,
          zIndex: 1000,
          display: deferredPrompt || isIOS ? 'flex' : 'none'
        }}
      >
        Install App
      </Button>
    )
  }

  return (
    <>
      <InstallButton />

      {/* Android/Desktop Install Dialog */}
      <Dialog 
        open={showInstallDialog} 
        onClose={() => setShowInstallDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Install Lab Attendance App</Typography>
            <IconButton onClick={() => setShowInstallDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={2}>
            {isMobile ? <PhoneIphone sx={{ fontSize: 64, color: 'primary.main' }} /> 
                     : <Computer sx={{ fontSize: 64, color: 'primary.main' }} />}
            <Typography variant="body1" sx={{ mt: 2 }}>
              Install the Lab Attendance app for a better experience:
            </Typography>
            <Box component="ul" sx={{ textAlign: 'left', mt: 2 }}>
              <li>Quick access from your home screen</li>
              <li>Works offline</li>
              <li>Receive notifications</li>
              <li>Full screen experience</li>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstallDialog(false)}>
            Maybe Later
          </Button>
          <Button variant="contained" onClick={handleInstallClick}>
            Install Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* iOS Install Instructions */}
      <Dialog 
        open={showIOSDialog} 
        onClose={() => setShowIOSDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Install on iOS</Typography>
            <IconButton onClick={() => setShowIOSDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography variant="body1" gutterBottom>
              To install this app on your iOS device:
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <li>Tap the Share button <Box component="span" sx={{ fontFamily: 'monospace' }}>⎋</Box> in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              This app works best when added to your home screen!
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIOSDialog(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success"
          icon={<CheckCircle />}
        >
          App installed successfully!
        </Alert>
      </Snackbar>
    </>
  )
}