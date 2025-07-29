'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import {
  Add,
  Search,
  Edit,
  Delete,
  Email,
  Badge,
  CreditCard,
  CheckCircle,
  Cancel,
  Phone,
} from '@mui/icons-material'
import PageWrapper from '@/components/PageWrapper'
import MobileUserCard from '@/components/MobileUserCard'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

export default function Users() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [error, setError] = useState('')
  const [unassignedRfids, setUnassignedRfids] = useState([])
  const [searchDebounce, setSearchDebounce] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rfid_uid: '',
    phone_number: '',
    reg_number: '',
    role: 'member',
  })

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchUsers()
  }, [searchDebounce, roleFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUnassignedRfids()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (searchDebounce) params.append('search', searchDebounce)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      
      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }
      
      setUsers(data.users)
    } catch (error) {
      setError(error.message)
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnassignedRfids = async () => {
    try {
      const response = await fetch('/api/users/unassigned-rfids')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch unassigned RFIDs')
      }
      
      setUnassignedRfids(data.rfids)
    } catch (error) {
      console.error('Error fetching unassigned RFIDs:', error)
    }
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setFormData({
      name: '',
      email: '',
      rfid_uid: '',
      phone_number: '',
      reg_number: '',
      role: 'member',
    })
    setOpenDialog(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      rfid_uid: user.rfid_uid || '',
      phone_number: user.phone_number || '',
      reg_number: user.reg_number || '',
      role: user.role || 'member',
    })
    setOpenDialog(true)
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }
      
      fetchUsers()
    } catch (error) {
      setError(error.message)
      console.error('Error deleting user:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const method = selectedUser ? 'PUT' : 'POST'
      const body = selectedUser ? { id: selectedUser.id, ...formData } : formData
      
      const response = await fetch('/api/users', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user')
      }
      
      setOpenDialog(false)
      fetchUsers()
      fetchUnassignedRfids()
    } catch (error) {
      setError(error.message)
      console.error('Error saving user:', error)
    }
  }

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ width: 36, height: 36 }}>
          {params.row.name?.charAt(0).toUpperCase() || '?'}
        </Avatar>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email fontSize="small" color="action" />
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'reg_number',
      headerName: 'Registration No.',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge fontSize="small" color="action" />
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'rfid_uid',
      headerName: 'RFID UID',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard fontSize="small" color="action" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'phone_number',
      headerName: 'Phone',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone fontSize="small" color="action" />
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'admin'
              ? 'error'
              : params.value === 'lead'
              ? 'warning'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Joined',
      width: 120,
      renderCell: (params) => {
        if (!params.value) return '-'
        const date = new Date(params.value)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDeleteUser(params.row.id)}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ]

  return (
    <PageWrapper>
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, md: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>User Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            Add User
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Paper sx={{ width: '100%' }}>
          {loading && <LinearProgress />}
          {isMobile ? (
            // Mobile view - Cards
            <Box sx={{ p: 1 }}>
              {users.map((user) => (
                <MobileUserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </Box>
          ) : (
            // Desktop view - DataGrid
            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={users}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                loading={loading}
                sx={{
                  '& .MuiDataGrid-cell': {
                    borderBottom: 'none',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { m: isMobile ? 1 : 2 }
          }}
        >
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Registration Number"
                value={formData.reg_number}
                onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                fullWidth
              />
              {!selectedUser && unassignedRfids.length > 0 ? (
                <FormControl fullWidth required>
                  <InputLabel>RFID UID</InputLabel>
                  <Select
                    value={formData.rfid_uid}
                    onChange={(e) => setFormData({ ...formData, rfid_uid: e.target.value })}
                    label="RFID UID"
                  >
                    <MenuItem value="">Manual Entry</MenuItem>
                    {unassignedRfids.map((rfid) => (
                      <MenuItem key={rfid} value={rfid}>
                        {rfid}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="RFID UID"
                  value={formData.rfid_uid}
                  onChange={(e) => setFormData({ ...formData, rfid_uid: e.target.value })}
                  fullWidth
                  required
                  disabled={selectedUser ? true : false}
                />
              )}
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedUser ? 'Update' : 'Add'} User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}