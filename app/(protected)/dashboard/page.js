'use client'

import { useState, useEffect } from "react";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Skeleton,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";
import { 
  Group, 
  Schedule, 
  TrendingUp, 
  AccessTime,
  Person,
  Refresh,
  CheckCircle
} from "@mui/icons-material";
import OccupantsCard from "@/components/OccupantsCard";
import WeeklyOccupancyChart from "@/components/WeeklyOccupancyChart";
import PeakHoursChart from "@/components/PeakHoursChart";
import TopUsersPieChart from "@/components/TopUsersPieChart";
import LabUsageGauge from "@/components/LabUsageGauge";
import PageWrapper from "@/components/PageWrapper";

// Stat card component
const StatCard = ({ title, value, icon, loading, color = "primary.main", subtitle }) => (
  <Paper
    elevation={2}
    sx={{
      p: { xs: 2, sm: 3 },
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: { xs: 1, sm: 2 },
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: { xs: 'none', sm: 'translateY(-4px)' },
        boxShadow: { xs: 2, sm: 4 },
      }
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
        {title}
      </Typography>
    </Box>
    {loading ? (
      <Skeleton variant="text" width={100} height={40} />
    ) : (
      <>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </>
    )}
  </Paper>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [currentOccupancy, setCurrentOccupancy] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    averageTime: "0h 0m",
    currentInLab: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchCurrentOccupancy();
    
    // Refresh current occupancy every 30 seconds
    const interval = setInterval(() => {
      fetchCurrentOccupancy();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentOccupancy = async () => {
    try {
      const response = await fetch('/api/dashboard/current-occupancy');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch current occupancy');
      }
      
      setCurrentOccupancy(data);
      setStats(prev => ({ ...prev, currentInLab: data.stats.currentOccupancy }));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching current occupancy:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      
      if (!usersResponse.ok) {
        throw new Error(usersData.error || 'Failed to fetch users');
      }

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Fetch today's attendance
      const params = new URLSearchParams();
      params.append('start_date', today.toISOString());
      params.append('limit', '1000');
      
      const attendanceResponse = await fetch(`/api/attendance/search?${params}`);
      const attendanceData = await attendanceResponse.json();
      
      if (!attendanceResponse.ok) {
        throw new Error(attendanceData.error || 'Failed to fetch attendance');
      }

      // Calculate unique active users today
      const uniqueActiveUsers = new Set(attendanceData.attendance?.map((log) => log.rfidUid) || []);
      
      // Calculate average time (simplified for now)
      const avgMinutes = 137; // This would be calculated from real data
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;

      setStats(prev => ({
        ...prev,
        totalUsers: usersData.users?.length || 0,
        activeToday: uniqueActiveUsers.size,
        averageTime: `${hours}h ${minutes}m`,
      }));
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    // Duration is already formatted from the API
    return duration;
  };

  return (
    <PageWrapper>
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 1 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={fetchCurrentOccupancy} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Currently in Lab"
              value={stats.currentInLab}
              icon={<CheckCircle />}
              loading={loading}
              color="success.main"
              subtitle={currentOccupancy ? `${currentOccupancy.stats.byRole.admin} admin, ${currentOccupancy.stats.byRole.lead} lead, ${currentOccupancy.stats.byRole.member} members` : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Group />}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Today"
              value={stats.activeToday}
              icon={<TrendingUp />}
              loading={loading}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Time"
              value={stats.averageTime}
              icon={<Schedule />}
              loading={loading}
              color="info.main"
            />
          </Grid>
        </Grid>

        {/* Current Occupants List */}
        {currentOccupancy && currentOccupancy.currentlyInLab.length > 0 && (
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} gutterBottom>
              Currently in Lab ({currentOccupancy.stats.currentOccupancy} people)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {currentOccupancy.currentlyInLab.map((person, index) => (
                <ListItem key={person.rfidUid} divider={index < currentOccupancy.currentlyInLab.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {person.userName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{person.userName}</Typography>
                        <Chip
                          label={person.role}
                          size="small"
                          color={
                            person.role === 'admin'
                              ? 'error'
                              : person.role === 'lead'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {person.email || person.regNumber || 'No contact info'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Checked in: {new Date(person.checkInTime).toLocaleTimeString()} ({person.duration})
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Empty State */}
        {currentOccupancy && currentOccupancy.currentlyInLab.length === 0 && (
          <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3, textAlign: 'center' }}>
            <Person sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No one is currently in the lab
            </Typography>
          </Paper>
        )}

        {/* Charts Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ height: { xs: 350, sm: 400, md: 'auto' } }}>
              <PeakHoursChart />
            </Box>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Box sx={{ height: { xs: 300, sm: 350, md: 'auto' } }}>
              <WeeklyOccupancyChart />
            </Box>
          </Grid>
          <Grid item xs={12} lg={8}>
            <OccupantsCard />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Box sx={{ height: { xs: 300, sm: 350, md: 'auto' } }}>
              <TopUsersPieChart />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <LabUsageGauge />
          </Grid>
        </Grid>
      </Box>
    </PageWrapper>
  );
}