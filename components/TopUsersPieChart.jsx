import { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function TopUsersPieChart() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    async function fetchTopUsers() {
      const { data } = await axios.get('/analytics/topusers');
      setTopUsers(data || []);
    }
    fetchTopUsers();
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Top Users (by Time)</Typography>
          <PieChart
            series={[
              {
                data: topUsers.map((user, idx) => ({
                  id: idx,
                  value: user.minutes,
                  label: user.name,
                })),
              },
            ]}
            width={400}
            height={300}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
