'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Box, Grid, Paper, Typography, Skeleton } from "@mui/material";
import { Group, Schedule, TrendingUp, AccessTime } from "@mui/icons-material";
import OccupantsCard from "@/components/OccupantsCard";
import WeeklyOccupancyChart from "@/components/WeeklyOccupancyChart";
import RushHoursChart from "@/components/RushHoursChart";
import TopUsersPieChart from "@/components/TopUsersPieChart";
import LabUsageGauge from "@/components/LabUsageGauge";
import PageWrapper from "@/components/PageWrapper";

// Stat card component
const StatCard = ({ title, value, icon, loading, color = "primary.main" }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </Box>
    {loading ? (
      <Skeleton variant="text" width={100} height={40} />
    ) : (
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
    )}
  </Paper>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    averageTime: "0h 0m",
    peakHour: "N/A",
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*");

      if (usersError) throw usersError;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's active users
      const { data: todayLogs, error: logsError } = await supabase
        .from("attendance_logs")
        .select("user_id")
        .gte("entry_time", today.toISOString())
        .lt("entry_time", tomorrow.toISOString());

      if (logsError) throw logsError;

      // Calculate unique active users today
      const uniqueActiveUsers = new Set(todayLogs?.map((log) => log.user_id) || []);

      // Calculate average time (mock data for now)
      const avgMinutes = 137; // This would be calculated from real data
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;

      setStats({
        totalUsers: users?.length || 0,
        activeToday: uniqueActiveUsers.size,
        averageTime: `${hours}h ${minutes}m`,
        peakHour: "2:00 PM", // This would be calculated from real data
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
              color="success.main"
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
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Peak Hour"
              value={stats.peakHour}
              icon={<AccessTime />}
              loading={loading}
              color="warning.main"
            />
          </Grid>
        </Grid>

        {/* Current Occupants and Lab Usage */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <OccupantsCard />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabUsageGauge />
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <WeeklyOccupancyChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <RushHoursChart />
          </Grid>
          <Grid item xs={12}>
            <TopUsersPieChart />
          </Grid>
        </Grid>
      </Box>
    </PageWrapper>
  );
}