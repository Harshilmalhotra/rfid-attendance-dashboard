import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { motion } from 'framer-motion';
import { fetchCurrentOccupants } from '../utils/api';

function formatTimeSpent(timeIn) {
  const now = new Date();
  const checkIn = new Date(timeIn);
  const diffMs = now.getTime() - checkIn.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}


export default function OccupantsCard() {
  const [occupants, setOccupants] = useState([]);

  useEffect(() => {
    async function getOccupants() {
      try {
        const data = await fetchCurrentOccupants();
        setOccupants(data.users || []);
      } catch (error) {
        console.error('Error fetching occupants:', error);
      }
    }

    getOccupants();

    // Optional: Auto-refresh every minute
    const interval = setInterval(getOccupants, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent sx={{ backgroundColor: '#f4f6fa', p: 0 }}>
          <Box sx={{ backgroundColor: '#4a90e4', color: 'white', p: 2, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
            <Typography variant="h6">
              Currently Inside Lab ({occupants.length})
            </Typography>
          </Box>

          <Box sx={{ overflowX: 'auto', width: '100%' }}>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>RFID UID</TableCell>
        <TableCell>Time In</TableCell>
        <TableCell>Time Spent</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {occupants.map((user, idx) => (
        <TableRow key={idx}>
          <TableCell>{user.name || 'Unknown'}</TableCell>
          <TableCell>{user.rfid_uid}</TableCell>
          <TableCell>
            {new Date(user.time_in).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </TableCell>
          <TableCell>{formatTimeSpent(user.time_in)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Box>

        </CardContent>
      </Card>

    </motion.div>
  );
}
