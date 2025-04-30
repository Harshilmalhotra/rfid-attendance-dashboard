import { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Gauge } from '@mui/x-charts/Gauge';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function LabUsageGauge() {
  const [occupancy, setOccupancy] = useState(0);

  useEffect(() => {
    async function fetchOccupancy() {
      const { data } = await axios.get('/analytics/current');
      const maxCapacity = 50; // Example: Max lab capacity
      const current = data.count || 0;
      setOccupancy(Math.round((current / maxCapacity) * 100));
    }
    fetchOccupancy();
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Current Lab Usage</Typography>
          <Gauge value={occupancy} valueMin={0} valueMax={100} width={250} height={250} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
