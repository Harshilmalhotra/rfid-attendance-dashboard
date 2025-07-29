'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  ExpandMore,
  Info,
  CheckCircle,
  ExitToApp,
  Schedule,
  TrendingUp,
  Warning,
  People,
  PersonAdd,
} from '@mui/icons-material'
import PageWrapper from '@/components/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const notificationTypes = [
  {
    id: 'check_in',
    title: 'Check-ins',
    description: 'Get notified when someone enters the lab',
    icon: <CheckCircle color="success" />,
    category: 'real-time'
  },
  {
    id: 'check_out',
    title: 'Check-outs',
    description: 'Get notified when someone leaves the lab',
    icon: <ExitToApp color="error" />,
    category: 'real-time'
  },
  {
    id: 'vip_entry',
    title: 'VIP Entries',
    description: 'Special alerts for admin and lead entries',
    icon: <PersonAdd color="warning" />,
    category: 'real-time'
  },
  {
    id: 'hourly_summary',
    title: 'Hourly Updates',
    description: 'Hourly summary of lab occupancy',
    icon: <Schedule color="info" />,
    category: 'scheduled'
  },
  {
    id: 'daily_summary',
    title: 'Daily Summary',
    description: 'Daily statistics and insights',
    icon: <TrendingUp color="primary" />,
    category: 'scheduled'
  },
  {
    id: 'capacity_alert',
    title: 'Capacity Alerts',
    description: 'Alerts when lab reaches capacity threshold',
    icon: <Warning color="warning" />,
    category: 'alerts'
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
    loadPreferences()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkPushSupport = () => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      setPushEnabled(Notification.permission === 'granted')
    }
  }

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      // Convert array to object for easier access
      const prefsObj = {}
      data?.forEach(pref => {
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
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user?.id,
          subscription_data: subscription.toJSON(),
          device_name: navigator.userAgent,
          browser_name: getBrowserName()
        })

      if (error) throw error

      setPushEnabled(true)
      setSuccess('Push notifications enabled successfully!')
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      setError('Failed to enable push notifications')
    }
  }

  const getBrowserName = () => {
    const agent = navigator.userAgent
    if (agent.includes('Chrome')) return 'Chrome'
    if (agent.includes('Firefox')) return 'Firefox'
    if (agent.includes('Safari')) return 'Safari'
    if (agent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  const toggleNotification = async (type, enabled) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          notification_type: type,
          enabled: enabled,
          push_enabled: enabled,
          email_enabled: false
        })

      if (error) throw error

      setPreferences(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          enabled: enabled,
          push_enabled: enabled
        }
      }))

      setSuccess('Preferences updated successfully!')
    } catch (error) {
      console.error('Error updating preferences:', error)
      setError('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ p: 3 }}>
          <Typography>Loading...</Typography>
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
                Push notifications are not supported in your browser
              </Alert>
            ) : !pushEnabled ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enable push notifications to receive real-time alerts
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
                Push notifications are enabled
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Notification Types
        </Typography>

        {/* Real-time Notifications */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Real-time Notifications</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {notificationTypes
                .filter(nt => nt.category === 'real-time')
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

        {/* Scheduled Summaries */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Scheduled Summaries</Typography>
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

        {/* Alerts */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Alerts & Warnings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {notificationTypes
                .filter(nt => nt.category === 'alerts')
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
            • Real-time notifications alert you immediately when events occur
            <br />
            • Scheduled summaries provide periodic updates at set intervals
            <br />
            • You can customize which notifications you receive
            <br />
            • Notifications require push permissions to be enabled
          </Typography>
        </Box>
      </Box>
    </PageWrapper>
  )
}