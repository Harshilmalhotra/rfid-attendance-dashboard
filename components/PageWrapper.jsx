// components/PageWrapper.jsx
'use client'

import { motion } from "framer-motion";
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.25,
};

export default function PageWrapper({ children }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#fafafa',
        color: theme.palette.text.primary,
      }}
    >
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </Box>
  );
}
