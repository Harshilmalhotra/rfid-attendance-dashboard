'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  Send,
  Campaign,
  People,
  AdminPanelSettings,
  SupervisorAccount,
  Group,
  History,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh,
} from '@mui/icons-material'
import PageWrapper from '@/components/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const priorityConfig = {
  low: { color: 'default', icon: <Info /> },
  normal: { color: 'primary', icon: <Campaign /> },
  high: { color: 'warning', icon: <Warning /> },
  urgent: { color: 'error', icon: <ErrorIcon /> },
}

export default function BroadcastPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [history, setHistory] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [recipientCount, setRecipientCount] = useState(0)
  
  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState('normal')
  const [targetRoles, setTargetRoles] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkUserRole()
    loadBroadcastHistory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Calculate recipient count when target roles change
    calculateRecipients()
  }, [targetRoles]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkUserRole = async () => {
    try {
      if (!user?.email) {
        router.push('/dashboard')
        return
      }
      
      const { data, error } = await supabase
        .from('admin')
        .select('email')
        .eq('email', user.email.toLowerCase())
        .single()

      if (error || !data) {
        // Not an admin
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadBroadcastHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_messages')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const calculateRecipients = async () => {
    try {
      let query = supabase
        .from('push_subscriptions')
        .select('user_id', { count: 'exact', head: true })

      if (targetRoles.length > 0) {
        // Get user IDs with specified roles
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .in('role', targetRoles)
        
        if (users) {
          const userIds = users.map(u => u.id)
          query = query.in('user_id', userIds)
        }
      }

      const { count } = await query
      setRecipientCount(count || 0)
    } catch (error) {
      console.error('Error calculating recipients:', error)
    }
  }

  const handleSendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      setError('Please enter both title and message')
      return
    }

    setShowPreview(false)
    setSending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          priority,
          targetRoles: targetRoles.length > 0 ? targetRoles : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send broadcast')
      }

      setSuccess(`Broadcast sent successfully to ${data.sentCount} users!`)
      
      // Reset form
      setTitle('')
      setBody('')
      setPriority('normal')
      setTargetRoles([])
      
      // Reload history
      loadBroadcastHistory()
    } catch (error) {
      console.error('Error sending broadcast:', error)
      setError(error.message || 'Failed to send broadcast')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageWrapper>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <PageWrapper>
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Campaign sx={{ mr: 2, fontSize: 32 }} color="primary" />
          <Typography variant="h4">Broadcast Notification</Typography>
        </Box>

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

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Broadcast Form */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Create Broadcast Message
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label="Notification Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g., Lab Maintenance Notice"
                />

                <TextField
                  label="Message"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  placeholder="Enter your broadcast message here..."
                />

                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Target Audience</InputLabel>
                    <Select
                      multiple
                      value={targetRoles}
                      onChange={(e) => setTargetRoles(e.target.value)}
                      label="Target Audience"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.length === 0 ? (
                            <Chip label="All Users" size="small" />
                          ) : (
                            selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))
                          )}
                        </Box>
                      )}
                    >
                      <MenuItem value="admin">
                        <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                        <ListItemText primary="Admins" />
                      </MenuItem>
                      <MenuItem value="lead">
                        <ListItemIcon><SupervisorAccount /></ListItemIcon>
                        <ListItemText primary="Leads" />
                      </MenuItem>
                      <MenuItem value="member">
                        <ListItemIcon><Group /></ListItemIcon>
                        <ListItemText primary="Members" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Alert severity="info" icon={<People />}>
                  This notification will be sent to{' '}
                  <strong>{recipientCount}</strong>{' '}
                  {targetRoles.length === 0 ? 'all users' : `${targetRoles.join(', ')}`}{' '}
                  with push notifications enabled
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreview(true)}
                    disabled={!title || !body}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => setShowPreview(true)}
                    disabled={!title || !body || sending}
                  >
                    {sending ? 'Sending...' : 'Send Broadcast'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* Guidelines */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Broadcast Guidelines
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Keep messages concise and clear"
                      secondary="Users are more likely to read short, focused messages"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Use appropriate priority levels"
                      secondary="Reserve 'Urgent' for critical announcements only"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Target specific audiences when relevant"
                      secondary="Send role-specific messages to reduce notification fatigue"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* History */}
          <Box sx={{ width: { xs: '100%', md: 350 } }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Broadcasts</Typography>
                <IconButton onClick={loadBroadcastHistory} size="small">
                  <Refresh />
                </IconButton>
              </Box>
              
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No broadcasts sent yet
                </Typography>
              ) : (
                <List>
                  {history.map((broadcast, index) => (
                    <React.Fragment key={broadcast.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {priorityConfig[broadcast.priority].icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">
                                {broadcast.title}
                              </Typography>
                              <Chip 
                                label={`${broadcast.sent_to_count} sent`}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {broadcast.body}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                By {broadcast.created_by_name} • {new Date(broadcast.sent_at).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < history.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </Stack>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Preview Notification</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar src="/logo.png" sx={{ width: 40, height: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {body}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Lab Attendance • now
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Alert severity="info">
              Priority: <Chip label={priority} size="small" color={priorityConfig[priority].color} sx={{ ml: 1 }} />
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<Send />} onClick={handleSendBroadcast} disabled={sending}>
              {sending ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}