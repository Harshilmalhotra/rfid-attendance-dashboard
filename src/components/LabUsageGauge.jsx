import { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Gauge } from '@mui/x-charts/Gauge';
import { motion } from 'framer-motion';
import { fetchCurrentOccupants } from '../utils/api';

export default function LabUsageGauge() {
  const [occupancy, setOccupancy] = useState(0);
  const maxCapacity = 20; // You can update this based on your lab size

  useEffect(() => {
    async function getOccupancy() {
      try {
        const data = await fetchCurrentOccupants();
        setOccupancy(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch current occupancy:', err);
      }
    }

    getOccupancy();
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Lab Occupancy
          </Typography>
          <Gauge
            value={occupancy}
            valueMin={0}
            valueMax={maxCapacity}
            width={250}
            height={250}
          />
          <Typography align="center" variant="body2" sx={{ marginTop: 1 }}>
            {occupancy} / {maxCapacity} people
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
