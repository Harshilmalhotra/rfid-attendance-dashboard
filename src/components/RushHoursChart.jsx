import { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { motion } from 'framer-motion';
import { fetchRushHours } from '../utils/api'; 

export default function RushHoursChart() {
  const [rushData, setRushData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchRushHours();
        if (Array.isArray(data)) {
          setRushData(data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Failed to fetch rush hours data:", err);
      }
    }
    fetchData();
  }, []);

  const hours = rushData.map((d) => d.hour);
  const counts = rushData.map((d) => d.check_ins); // ✅ use check_ins

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Rush Hours</Typography>
          <BarChart
            xAxis={[{ data: hours, scaleType: 'band' }]}
            series={[{ data: counts, label: 'Check-ins' }]}
            width={500}
            height={300}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
