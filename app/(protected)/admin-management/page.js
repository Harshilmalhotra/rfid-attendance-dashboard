'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material'
import {
  Add,
  Delete,
  AdminPanelSettings,
  Email
} from '@mui/icons-material'
import PageWrapper from '@/components/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [admins, setAdmins] = useState([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [emailToDelete, setEmailToDelete] = useState('')

  useEffect(() => {
    checkAdminStatus()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdminStatus = async () => {
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
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      loadAdmins()
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error('Error loading admins:', error)
      setError('Failed to load admin list')
    }
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newAdminEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    try {
      const { error } = await supabase
        .from('admin')
        .insert([{ 
          email: newAdminEmail.toLowerCase().trim(),
          created_by: user.email
        }])

      if (error) {
        if (error.code === '23505') {
          setError('This email is already an admin')
        } else {
          throw error
        }
        return
      }

      setSuccess(`Successfully added ${newAdminEmail} as admin`)
      setNewAdminEmail('')
      loadAdmins()
    } catch (error) {
      console.error('Error adding admin:', error)
      setError('Failed to add admin')
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      const { error } = await supabase
        .from('admin')
        .delete()
        .eq('email', emailToDelete)

      if (error) throw error

      setSuccess(`Successfully removed ${emailToDelete} from admins`)
      setDeleteDialogOpen(false)
      setEmailToDelete('')
      loadAdmins()
    } catch (error) {
      console.error('Error deleting admin:', error)
      setError('Failed to remove admin')
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
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ mr: 2, fontSize: 32 }} color="primary" />
          <Typography variant="h4">Admin Management</Typography>
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

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Admin
          </Typography>
          <form onSubmit={handleAddAdmin}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Email Address"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                fullWidth
                placeholder="admin@example.com"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                sx={{ minWidth: 120 }}
              >
                Add Admin
              </Button>
            </Box>
          </form>
        </Paper>

        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              Current Admins ({admins.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Added On</TableCell>
                  <TableCell>Added By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {admin.email}
                        {admin.email === user.email && (
                          <Chip label="You" size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {admin.created_by || 'System'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setEmailToDelete(admin.email)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={admin.email === user.email}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No admins found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Remove Admin</DialogTitle>
          <DialogContent>
            Are you sure you want to remove {emailToDelete} from admins?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteAdmin} 
              color="error" 
              variant="contained"
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}