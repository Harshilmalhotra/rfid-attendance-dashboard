'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import PageWrapper from '@/components/PageWrapper'

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attendanceData, setAttendanceData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  
  // Filter states
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [rfidUid, setRfidUid] = useState('')
  const [userName, setUserName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [checkType, setCheckType] = useState('all')
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const fetchAttendance = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams()
      
      if (startDate) params.append('start_date', startDate.format('YYYY-MM-DD'))
      if (endDate) params.append('end_date', endDate.format('YYYY-MM-DD'))
      if (rfidUid) params.append('rfid_uid', rfidUid)
      if (userName) params.append('user_name', userName)
      if (regNumber) params.append('reg_number', regNumber)
      if (checkType !== 'all') params.append('check_type', checkType)
      params.append('limit', rowsPerPage)
      params.append('offset', page * rowsPerPage)
      
      const response = await fetch(`/api/attendance/search?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance data')
      }
      
      setAttendanceData(data.attendance)
      setTotalCount(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [page, rowsPerPage])

  const handleSearch = () => {
    setPage(0)
    fetchAttendance()
  }

  const handleReset = () => {
    setStartDate(null)
    setEndDate(null)
    setRfidUid('')
    setUserName('')
    setRegNumber('')
    setCheckType('all')
    setPage(0)
    fetchAttendance()
  }

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'RFID UID', 'User Name', 'Email', 'Reg Number', 'Role', 'Check Time', 'Check Type']
    const csvContent = [
      headers.join(','),
      ...attendanceData.map(row => [
        row.id,
        row.rfidUid,
        row.userName,
        row.email,
        row.regNumber,
        row.role,
        new Date(row.checkTime).toLocaleString(),
        row.checkType
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Attendance Records
          </Typography>
          
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search Filters
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <FormControl fullWidth>
                  <InputLabel>Check Type</InputLabel>
                  <Select
                    value={checkType}
                    onChange={(e) => setCheckType(e.target.value)}
                    label="Check Type"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="IN">Check In</MenuItem>
                    <MenuItem value="OUT">Check Out</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="RFID UID"
                  value={rfidUid}
                  onChange={(e) => setRfidUid(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="User Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
              </Stack>
              
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  disabled={loading}
                >
                  Search
                </Button>
              </Stack>
            </Stack>
          </Paper>
          
          {/* Results */}
          <Paper sx={{ width: '100%', mb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Results ({totalCount} records)
              </Typography>
              <Tooltip title="Export to CSV">
                <IconButton onClick={exportToCSV} disabled={attendanceData.length === 0}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>RFID UID</TableCell>
                        <TableCell>User Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Reg Number</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Check Time</TableCell>
                        <TableCell>Check Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.rfidUid}</TableCell>
                          <TableCell>{row.userName}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.regNumber}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.role}
                              size="small"
                              color={row.role === 'admin' ? 'error' : row.role === 'lead' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(row.checkTime).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.checkType}
                              size="small"
                              color={row.checkType === 'IN' ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Paper>
        </Box>
      </LocalizationProvider>
    </PageWrapper>
  )
}