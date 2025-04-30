import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        padding: 2,
        textAlign: 'center',
        position: 'relative',
        bottom: 0,
        width: '100%',
        boxShadow: '0 -1px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © {currentYear} ISD Lab, SRM Institute of Science and Technology, Kattankulathur. All rights reserved.
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Created with 💖 by{' '}
        <Link href="https://www.linkedin.com/in/harshilmalhotra/" target="_blank" rel="noopener noreferrer">
          Harshil Malhotra
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
