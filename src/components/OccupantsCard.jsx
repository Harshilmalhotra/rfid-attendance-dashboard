import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { motion } from 'framer-motion';
import { fetchCurrentOccupants } from '../utils/api'; 

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
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card>
        <CardContent style={{ backgroundColor: '#f4f6fa' }}>
          <Typography variant="h6" gutterBottom>
            Currently Inside Lab ({occupants.length})
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>RFID UID</TableCell>
                <TableCell>Time In</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
