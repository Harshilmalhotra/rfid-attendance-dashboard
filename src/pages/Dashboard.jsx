import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import OccupantsCard from '../components/OccupantsCard';
import LabUsageGauge from '../components/LabUsageGauge';
import WeeklyOccupancyChart from '../components/WeeklyOccupancyChart';
import RushHoursChart from '../components/RushHoursChart';
// import TopUsersPieChart from '../components/TopUsersPieChart';
// import HeatmapAttendance from '../components/HeatmapAttendance'; 

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="p-8"
    >
      <Box sx={{ paddingLeft: { xs: 2, sm: 8, md: 10 }, paddingTop: 2 }}>
        <Typography variant="h4" gutterBottom>
          Lab Analytics Dashboard
        </Typography>

        {/* NEW MUI Grid way */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <OccupantsCard />
          <LabUsageGauge />
          <WeeklyOccupancyChart className="col-span-1 md:col-span-2" />
          <RushHoursChart />
          {/* <TopUsersPieChart /> */}
        </div>
      </Box>
    </motion.div>
  );
}