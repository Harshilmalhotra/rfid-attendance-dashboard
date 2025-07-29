'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  Stack,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  ExpandMore,
  Info,
  CheckCircle,
  Login,
  Logout,
  Schedule,
  TrendingUp,
  Warning,
  Group,
} from '@mui/icons-material'
import PageWrapper from '@/components/PageWrapper'
import { useAuth } from '@/context/AuthContext'

const notificationTypes = [
  {
    id: 'user_check_in',
    title: 'User Check-ins',
    description: 'Get notified when users enter the lab',
    icon: <Login color="success" />,
    category: 'activity'
  },
  {
    id: 'user_check_out',
    title: 'User Check-outs',
    description: 'Get notified when users leave the lab',
    icon: <Logout color="error" />,
    category: 'activity'
  },
  {
    id: 'lab_capacity',
    title: 'Lab Capacity',
    description: 'Get notified when lab reaches certain capacity levels',
    icon: <Group color="warning" />,
    category: 'activity'
  },
  {
    id: 'daily_summary',
    title: 'Daily Summary',
    description: 'Daily statistics and usage report',
    icon: <TrendingUp color="primary" />,
    category: 'scheduled'
  },
  {
    id: 'weekly_report',
    title: 'Weekly Report',
    description: 'Weekly attendance and activity summary',
    icon: <Schedule color="info" />,
    category: 'scheduled'
  },
  {
    id: 'maintenance_reminder',
    title: 'Maintenance Reminders',
    description: 'Reminders for system maintenance and updates',
    icon: <Warning color="warning" />,
    category: 'system'
  },
]

export default function NotificationsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({})
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkPushSupport()
    if (user?.id) {
      loadPreferences()
    }
  }, [user])

  const checkPushSupport = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      setPushEnabled(Notification.permission === 'granted')
      
      // Check if service worker is registered
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        // Register service worker if not already registered
        try {
          await navigator.serviceWorker.register('/sw.js')
        } catch (error) {
          console.error('Service worker registration failed:', error)
        }
      }
    }
  }

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load preferences')
      }

      // Convert array to object for easier access
      const prefsObj = {}
      data.preferences?.forEach(pref => {
        prefsObj[pref.notification_type] = pref
      })
      setPreferences(prefsObj)
    } catch (error) {
      console.error('Error loading preferences:', error)
      setError('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const enablePushNotifications = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        setError('Push notification permission denied')
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BKd0bWccZHe6OdJp_gYV6Xz_kKUe5wZBN1Ad7OGhLZnXjgJ3bzaJrqnFt9AXtfsVc7d9ASCRAMKmVfAqNqUQwqw'
        )
      })

      // Save subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          device_name: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setPushEnabled(true)
      setSuccess('Push notifications enabled successfully!')
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      setError('Failed to enable push notifications')
    }
  }

  const toggleNotification = async (type, enabled) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_type: type,
          enabled: enabled,
          push_enabled: enabled,
          email_enabled: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update preferences')
      }

      setPreferences(prev => ({
        ...prev,
        [type]: data.preference
      }))

      setSuccess('Preferences updated successfully!')
    } catch (error) {
      console.error('Error updating preferences:', error)
      setError('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Notification Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Push Notifications Setup */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsActive sx={{ mr: 1 }} />
              <Typography variant="h6">Push Notifications</Typography>
            </Box>
            
            {!pushSupported ? (
              <Alert severity="warning">
                Push notifications are not supported in your browser. Try using Chrome, Firefox, or Edge.
              </Alert>
            ) : !pushEnabled ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enable push notifications to receive real-time alerts about lab activities
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Notifications />}
                  onClick={enablePushNotifications}
                >
                  Enable Push Notifications
                </Button>
              </Box>
            ) : (
              <Alert severity="success" icon={<CheckCircle />}>
                Push notifications are enabled. You can manage specific notifications below.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Notification Types
        </Typography>

        {/* Activity Notifications */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Activity Notifications</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {notificationTypes
                .filter(nt => nt.category === 'activity')
                .map(notif => (
                  <FormControlLabel
                    key={notif.id}
                    control={
                      <Switch
                        checked={preferences[notif.id]?.enabled || false}
                        onChange={(e) => toggleNotification(notif.id, e.target.checked)}
                        disabled={!pushEnabled || saving}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notif.icon}
                        <Box>
                          <Typography>{notif.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notif.description}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Scheduled Reports */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Scheduled Reports</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {notificationTypes
                .filter(nt => nt.category === 'scheduled')
                .map(notif => (
                  <FormControlLabel
                    key={notif.id}
                    control={
                      <Switch
                        checked={preferences[notif.id]?.enabled || false}
                        onChange={(e) => toggleNotification(notif.id, e.target.checked)}
                        disabled={!pushEnabled || saving}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notif.icon}
                        <Box>
                          <Typography>{notif.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notif.description}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* System Notifications */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>System Notifications</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {notificationTypes
                .filter(nt => nt.category === 'system')
                .map(notif => (
                  <FormControlLabel
                    key={notif.id}
                    control={
                      <Switch
                        checked={preferences[notif.id]?.enabled || false}
                        onChange={(e) => toggleNotification(notif.id, e.target.checked)}
                        disabled={!pushEnabled || saving}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notif.icon}
                        <Box>
                          <Typography>{notif.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notif.description}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Help Text */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Info color="info" />
            <Typography variant="subtitle2">About Notifications</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            • Activity notifications alert you about real-time lab events
            <br />
            • Scheduled reports provide periodic summaries of lab usage
            <br />
            • System notifications keep you informed about maintenance and updates
            <br />
            • All notifications require push permissions to be enabled first
          </Typography>
        </Box>
      </Box>
    </PageWrapper>
  )
}