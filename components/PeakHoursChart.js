'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { AccessTime, TrendingUp } from '@mui/icons-material'

export default function PeakHoursChart() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [chartType, setChartType] = useState('bar')
  const [timeRange, setTimeRange] = useState(30)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    fetchPeakHoursData()
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPeakHoursData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/dashboard/peak-hours?days=${timeRange}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch peak hours data')
      }
      
      setData(result)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching peak hours:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" color="primary">
            Avg: {payload[0].value} people
          </Typography>
          {payload[1] && (
            <Typography variant="body2" color="secondary">
              Max: {payload[1].value} people
            </Typography>
          )}
        </Paper>
      )
    }
    return null
  }

  const renderChart = () => {
    if (!data || !data.chartData) return null

    const commonProps = {
      data: data.chartData,
      margin: { 
        top: 5, 
        right: isMobile ? 5 : 10, 
        left: isMobile ? 35 : 40, 
        bottom: isMobile ? 20 : 5 
      }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgOccupancy" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Average Occupancy"
              dot={{ fill: '#8884d8' }}
            />
            <Line 
              type="monotone" 
              dataKey="maxOccupancy" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Max Occupancy"
              strokeDasharray="5 5"
              dot={{ fill: '#82ca9d' }}
            />
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="avgOccupancy" 
              stroke="#8884d8" 
              fill="#8884d8"
              fillOpacity={0.6}
              name="Average Occupancy"
            />
          </AreaChart>
        )
      
      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="avgOccupancy" 
              fill="#8884d8"
              name="Average Occupancy"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        )
    }
  }

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%', width: '100%', overflow: 'visible' }}>
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} gutterBottom>
              Peak Hours Analysis
            </Typography>
            {data && data.peakHour && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <AccessTime fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Peak Hour: 
                </Typography>
                <Chip 
                  label={`${data.peakHour.time} (${data.peakHour.avgOccupancy} avg)`}
                  color="primary"
                  size="small"
                  icon={<TrendingUp />}
                />
              </Box>
            )}
          </Box>
          
          <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              sx={{ 
                '& .MuiToggleButton-root': { 
                  px: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                } 
              }}
            >
              <ToggleButton value={7}>7D</ToggleButton>
              <ToggleButton value={30}>30D</ToggleButton>
              <ToggleButton value={90}>90D</ToggleButton>
            </ToggleButtonGroup>
            
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                '& .MuiToggleButton-root': { 
                  px: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                } 
              }}
            >
              <ToggleButton value="bar">Bar</ToggleButton>
              <ToggleButton value="line">Line</ToggleButton>
              <ToggleButton value="area">Area</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ width: '100%', height: { xs: 300, sm: 320 }, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </Box>

        {data && data.calculatedFromRaw && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            * Data calculated from attendance records
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}