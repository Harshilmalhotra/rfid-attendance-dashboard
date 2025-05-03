import { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
  const counts = rushData.map((d) => d.check_ins);

  const colors = ["#37c85c", "#ffb42e", "#ff6966", "#4a90e4"];
  
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent style={{ backgroundColor: '#f4f6fa' }}>  {/* Set background color here */}
          <Typography variant="h6" gutterBottom>Rush Hours</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rushData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="check_ins" fill={colors[3]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
