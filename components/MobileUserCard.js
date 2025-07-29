'use client'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material'
import { useState } from 'react'
import { MoreVert, Email, Phone, Badge, CreditCard, Edit, Delete } from '@mui/icons-material'

export default function MobileUserCard({ user, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    onEdit(user)
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete(user.id)
  }

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
              {user.name?.charAt(0).toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {user.name || 'Unknown'}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                color={user.role === 'admin' ? 'error' : user.role === 'lead' ? 'warning' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Stack spacing={1} sx={{ mt: 2 }}>
          {user.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" noWrap>{user.email}</Typography>
            </Box>
          )}
          {user.phone_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">{user.phone_number}</Typography>
            </Box>
          )}
          {user.reg_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge fontSize="small" color="action" />
              <Typography variant="body2">{user.reg_number}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard fontSize="small" color="action" />
            <Typography variant="body2" noWrap>{user.rfid_uid}</Typography>
          </Box>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  )
}