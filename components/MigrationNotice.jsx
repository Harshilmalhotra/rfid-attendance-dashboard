import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Info } from '@mui/icons-material';

const MigrationNotice = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('migrationNoticeShown');
    if (!hasSeenNotice) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('migrationNoticeShown', 'true');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Info color="primary" />
        Important Notice
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body1" paragraph>
            We are in the process of migrating our application and backend to Next.js.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            During this transition, you may experience some disruption in services. We apologize for any inconvenience caused and appreciate your patience.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            - Harshil Malhotra
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={handleClose} variant="contained" color="primary">
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MigrationNotice;