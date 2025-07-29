'use client'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  Stack
} from '@mui/material'
import { useState } from 'react'
import { ExpandMore, ExpandLess, AccessTime, CreditCard, Email, Badge } from '@mui/icons-material'

export default function MobileAttendanceCard({ record }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {record.userName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  label={record.checkType}
                  size="small"
                  color={record.checkType === 'IN' ? 'success' : 'error'}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(record.checkTime).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
        
        <Collapse in={expanded}>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard fontSize="small" color="action" />
              <Typography variant="body2">RFID: {record.rfidUid}</Typography>
            </Box>
            {record.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{record.email}</Typography>
              </Box>
            )}
            {record.regNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge fontSize="small" color="action" />
                <Typography variant="body2">Reg: {record.regNumber}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={record.role}
                size="small"
                color={record.role === 'admin' ? 'error' : record.role === 'lead' ? 'warning' : 'default'}
              />
            </Box>
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  )
}